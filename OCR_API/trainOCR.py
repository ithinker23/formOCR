import psycopg2
import config
import pandas as pd
from sklearn.model_selection import train_test_split
import torch
from torch.utils.data import Dataset
from PIL import Image
from transformers import TrOCRProcessor
from io import BytesIO
from datasets import load_metric
from transformers import VisionEncoderDecoderModel, default_data_collator, Seq2SeqTrainer, Seq2SeqTrainingArguments
import os
import cv2
from PIL import Image
import numpy as np
from services.sceneTextService import preprocess_image

# torch.cuda.empty_cache()
# os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:100"

class IAMDataset(Dataset):
    def __init__(self, df, processor, max_target_length=128):
        self.df = df
        self.processor = processor
        self.max_target_length = max_target_length

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        # get file name + text 
        image = self.df['image'][idx]
        text = self.df['text'][idx]
        # prepare image (i.e. resize + normalize)
        image = Image.open(image).convert("RGB")
        pixel_values = self.processor(image, return_tensors="pt").pixel_values
        # add labels (input_ids) by encoding the text
        labels = self.processor.tokenizer(text, 
                                          padding="max_length", 
                                          max_length=self.max_target_length).input_ids
        # important: make sure that PAD tokens are ignored by the loss function
        labels = [label if label != self.processor.tokenizer.pad_token_id else -100 for label in labels]

        encoding = {"pixel_values": pixel_values.squeeze(), "labels": torch.tensor(labels)}
        return encoding

db = psycopg2.connect(
        host=config.db_host,
        database=config.db_name,
        user=config.db_user,
        password=config.db_pass)

cur = db.cursor()

query = "SELECT field_image, validated_answer FROM ocr_results WHERE validated_answer is not null"

cur.execute(query)

data = cur.fetchall()

train = []
i = 5
for field in data:
    # image = Image.open(BytesIO(field[0]))
    # cv2.imshow("image", np.array(image))
    # cv2.waitKey(0)
    train.append([BytesIO(field[0]),field[1]])

    if i <= 0:
        break
    i -= 1

os.environ["WANDB_DISABLED"] = "true"
df = pd.DataFrame(train, columns=['image', 'text'])

train_df, test_df = train_test_split(df, test_size=0.15)
# we reset the indices to start from zero
train_df.reset_index(drop=True, inplace=True)
test_df.reset_index(drop=True, inplace=True)


processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-stage1")

train_dataset = IAMDataset(df=train_df,
                           processor=processor)
eval_dataset = IAMDataset(df=test_df,
                           processor=processor)

cer_metric = load_metric("cer")

def compute_metrics(pred):
    labels_ids = pred.label_ids
    pred_ids = pred.predictions

    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    labels_ids[labels_ids == -100] = processor.tokenizer.pad_token_id
    label_str = processor.batch_decode(labels_ids, skip_special_tokens=True)

    cer = cer_metric.compute(predictions=pred_str, references=label_str)

    return {"cer": cer}

model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-stage1")

# set special tokens used for creating the decoder_input_ids from the labels
model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
model.config.pad_token_id = processor.tokenizer.pad_token_id
# make sure vocab size is set correctly
model.config.vocab_size = model.config.decoder.vocab_size

# set beam search parameters
model.config.eos_token_id = processor.tokenizer.sep_token_id
model.config.max_length = 10
model.config.early_stopping = True
model.config.no_repeat_ngram_size = 3
model.config.length_penalty = 2.0
model.config.num_beams = 4

training_args = Seq2SeqTrainingArguments(
    num_train_epochs=3,
    predict_with_generate=True,
    evaluation_strategy="steps",
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    fp16=True, 
    output_dir=".",
    logging_steps=2,
    save_steps=100,
    eval_steps=200,
    gradient_accumulation_steps = 8,
    save_total_limit=1,
)

# instantiate trainer
trainer = Seq2SeqTrainer(
    model=model,
    tokenizer=processor.feature_extractor,
    args=training_args,
    compute_metrics=compute_metrics,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    data_collator=default_data_collator,
)

trainer.train()

os.makedirs("OCR_model/")
model.save_pretrained("OCR_model/")