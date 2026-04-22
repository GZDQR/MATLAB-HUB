import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException
from admin_server.config import s3_client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN

router = APIRouter()

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPG and PNG files are allowed")

    # 生成唯一文件名
    ext = ".jpg" if file.content_type == "image/jpeg" else ".png"
    filename = f"models/{uuid.uuid4().hex}{ext}"

    try:
        # 传送到 R2
        s3_client.upload_fileobj(
            file.file,
            R2_BUCKET_NAME,
            filename,
            ExtraArgs={"ContentType": file.content_type}
        )
        
        # 返回公共访问 URL
        return {"url": f"{R2_PUBLIC_DOMAIN}/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
