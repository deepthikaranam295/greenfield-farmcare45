import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from app.core.config import settings
from app.core.logging import logger


def _get_client():
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def upload_file_to_s3(file_bytes: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    if not settings.AWS_ACCESS_KEY_ID:
        logger.warning("S3 not configured — returning placeholder URL")
        return f"https://placeholder-s3/{key}"
    try:
        client = _get_client()
        client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )
        return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
    except ClientError as e:
        logger.error("S3 upload failed: %s", e)
        raise HTTPException(status_code=500, detail="File upload failed")


def delete_file_from_s3(key: str) -> None:
    if not settings.AWS_ACCESS_KEY_ID:
        return
    try:
        _get_client().delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
    except ClientError as e:
        logger.error("S3 delete failed: %s", e)
