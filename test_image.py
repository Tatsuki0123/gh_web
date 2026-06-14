from PIL import Image
import pytesseract
img = Image.open("/tmp/file_attachments/image.png")
text = pytesseract.image_to_string(img)
print(text)
