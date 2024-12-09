import base64
import io
import os
import uuid
from PIL import Image
from PyPDF2 import PdfReader
from docx import Document

PATH = "static/uploads"


def save_image(image_base64: str) -> str:
    if not image_base64:
        return None
    save_directory = PATH + "/images"
    os.makedirs(save_directory, exist_ok=True)

    if os.path.exists(image_base64):
        return image_base64

    image_data = base64.b64decode(image_base64)

    image_io = io.BytesIO(image_data)

    try:
        with Image.open(image_io) as img:
            image_format = img.format.lower()

            if image_format not in ["png", "jpeg"]:
                raise ValueError("Unsupported image format")

            filename = f"{uuid.uuid4()}.{image_format}"
            file_path = os.path.join(save_directory, filename)

            img.save(file_path)

            return file_path

    except ValueError as e:
        raise ValueError(
            f"Cannot identify or save image file; it may be corrupted, not a valid image, or unsupported format. {str(e)}"
        )


def save_documents(document_files: list[str]) -> list[str]:
    if not document_files:
        return []

    save_directory = PATH + "/documents"
    os.makedirs(save_directory, exist_ok=True)

    saved_files = []

    for document_base64 in document_files:
        try:
            document_data = base64.b64decode(document_base64)
            document_io = io.BytesIO(document_data)

            try:
                PdfReader(document_io)
                file_extension = "pdf"
            except Exception:
                try:
                    document_io.seek(0)
                    Document(document_io)
                    file_extension = "docx"
                except Exception:
                    raise ValueError("Unsupported file format. Only PDF and DOCX are allowed.")

            filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(save_directory, filename)

            with open(file_path, "wb") as file:
                file.write(document_data)

            saved_files.append(file_path)

        except Exception as e:
            raise ValueError(f"Failed to save document. Error: {str(e)}")

    return saved_files
