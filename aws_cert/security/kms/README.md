# KMS (Key Management Service)

Managed service for creating and controlling encryption keys used to encrypt data. Integrates with most AWS services and provides centralized key management with hardware security modules.






Deny all requests that don't include SSE-KMS S3 encryption

{
   "Version":"2012-10-17",
   "Id":"PutObjectPolicy",
   "Statement":[{
         "Sid":"DenyUnEncryptedObjectUploads",
         "Effect":"Deny",
         "Principal":"*",
         "Action":"s3:PutObject",
         "Resource":"arn:aws:s3:::examplebucket/*",
         "Condition":{
            "StringNotEquals":{
               "s3:x-amz-server-side-encryption":"aws:kms"
            }
         }
      }
   ]
}