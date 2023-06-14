import torch
from PIL import Image
import pdf2image
import numpy
import cv2
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

processor = TrOCRProcessor.from_pretrained('microsoft/trocr-large-handwritten')
# model = VisionEncoderDecoderModel.from_pretrained('./OCR_model/')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-large-handwritten')

def preprocess_image(image, field):
    #get page for field
        
        image_size_multiplier = 5

        image = image.resize((image_size_multiplier*field.get('Page_Width'),image_size_multiplier*field.get('Page_Height')))

        #crop page to coordinates
        image = image.crop((image_size_multiplier*field.get('StartX'), image_size_multiplier*field.get('StartY'),image_size_multiplier*field.get('StartX') + image_size_multiplier*field.get('Width'),image_size_multiplier*field.get('StartY') + image_size_multiplier*field.get('Height')))

        # cv2.imshow("image", numpy.array(image))
        # cv2.waitKey()

        return image



def OCR_image(image):
    pixel_values = processor(images=image, return_tensors="pt").pixel_values

    generated_ids = model.generate(pixel_values)
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

    return generated_text



def OCR_from_template(name, fields):
    #images path
    file_path = "D:/Repos/formOCR/frontend/src/pdfs/Sample.pdf"

    print("Performing OCR on PDF")

    #use openCV to open image for parsing
    pages = pdf2image.convert_from_path(file_path)

    results = {"training_data":[]}

    for index in range(0,len(fields)):
        field = fields[index]

        pdf_image = pages[field.get('Page') - 1]

        image = preprocess_image(pdf_image, field)

        answer = OCR_image(image)
        
        fields[index]['Answer'] = answer

        results['training_data'].append({"template_name":name, "field_image":image, "prediction":answer, "field_name": field.get('Question')})

        print(answer)
    results["fields"] = fields

    return results



