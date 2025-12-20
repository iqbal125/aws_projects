# IAM (Identity and Access Management)

Manages access to AWS services and resources securely. Controls authentication and authorization through users, groups, roles, and policies to specify permissions.

## IAM Policy Variables

Use IAM policy variables to create a single policy that restricts users to their own S3 folders (e.g., `bucket-a/user/${aws:username}/`). Policy variables act as placeholders that are replaced with actual values during policy evaluation, eliminating the need for individual per-user policies.

https://tutorialsdojo.com/aws-identity-and-access-management-iam/?src=udemy



On Prem AWS 
applications running outside of an AWS environment will need access keys for programmatic access to AWS resources.


https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys

https://aws.amazon.com/blogs/security/guidelines-for-protecting-your-aws-account-while-using-programmatic-access/



https://tutorialsdojo.com/aws-identity-and-access-management-iam/