A plugin for the Serverless framework to inspect the underlying
stack using [Checkov](https://www.checkov.io/) in order to scan the cloud infrastructure
configurations to find misconfigurations before they're
deployed.

Without Checkov, you may be introducing severe security risks
into your projects. Examples include, creating S3 buckets that are
publicly accessible and Lambda functions that allow unauthenticated
access. Misconfigurations such are these are never tested or
inspected as there are no guardrails.

> [!NOTE]
> This plugin has only been tested with the AWS provider and will
> not work if you are deploying to other providers e.g. GCP.

## Installation

Install using NPM by using the following command

```sh
npm install --save-dev @mridang/serverless-checkov-plugin
```

And then add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - @mridang/serverless-checkov-plugin
```

A thorough guide on installing plugins can be found at
https://www.serverless.com/framework/docs-guides-plugins

## Usage

There isn't anything specific to be done once the plugin is installed.
When you trigger a deployment (which in turn packages the function),
or, when you explicitly package the function, the plugin runs
the resultant Cloudformation template through Checkov using the
provided Docker container.

Below is what you can expect when packaging the application.

```
$ sls package

Packaging aws-node-project for stage dev (us-east-1)
Warning: cloudformation scan results:

Passed checks: 3, Failed checks: 6, Skipped checks: 0

Check: CKV_AWS_55: "Ensure S3 bucket has ignore public ACLs enabled"
        FAILED for resource: AWS::S3::Bucket.ServerlessDeploymentBucket
        File: /tmp/sls/cloudformation-template-create-stack.json:5-18
        Guide: https://docs.prismacloud.io/en/enterprise-edition/policy-reference/aws-policies/s3-policies/bc-aws-s3-21

                5  |     "ServerlessDeploymentBucket": {
                6  |       "Type": "AWS::S3::Bucket",
                7  |       "Properties": {
                8  |         "BucketEncryption": {
                9  |           "ServerSideEncryptionConfiguration": [
                10 |             {
                11 |               "ServerSideEncryptionByDefault": {
                12 |                 "SSEAlgorithm": "AES256"
                13 |               }
                14 |             }
                15 |           ]
                16 |         }
                17 |       }
                18 |     },

Check: CKV_AWS_18: "Ensure the S3 bucket has access logging enabled"
        FAILED for resource: AWS::S3::Bucket.ServerlessDeploymentBucket
        File: /tmp/sls/cloudformation-template-create-stack.json:5-18
        Guide: https://docs.prismacloud.io/en/enterprise-edition/policy-reference/aws-policies/s3-policies/s3-13-enable-logging

                5  |     "ServerlessDeploymentBucket": {
                6  |       "Type": "AWS::S3::Bucket",
                7  |       "Properties": {
                8  |         "BucketEncryption": {
                9  |           "ServerSideEncryptionConfiguration": [
                10 |             {
                11 |               "ServerSideEncryptionByDefault": {
                12 |                 "SSEAlgorithm": "AES256"
                13 |               }
                14 |             }
                15 |           ]
                16 |         }
                17 |       }
                18 |     },

Check: CKV_AWS_21: "Ensure the S3 bucket has versioning enabled"
        FAILED for resource: AWS::S3::Bucket.ServerlessDeploymentBucket
        File: /tmp/sls/cloudformation-template-create-stack.json:5-18
        Guide: https://docs.prismacloud.io/en/enterprise-edition/policy-reference/aws-policies/s3-policies/s3-16-enable-versioning

                5  |     "ServerlessDeploymentBucket": {
                6  |       "Type": "AWS::S3::Bucket",
                7  |       "Properties": {
                8  |         "BucketEncryption": {
                9  |           "ServerSideEncryptionConfiguration": [
                10 |             {
                11 |               "ServerSideEncryptionByDefault": {
                12 |                 "SSEAlgorithm": "AES256"
                13 |               }
                14 |             }
                15 |           ]
                16 |         }
                17 |       }
                18 |     },

Check: CKV_AWS_54: "Ensure S3 bucket has block public policy enabled"
        FAILED for resource: AWS::S3::Bucket.ServerlessDeploymentBucket
        File: /tmp/sls/cloudformation-template-create-stack.json:5-18
        Guide: https://docs.prismacloud.io/en/enterprise-edition/policy-reference/aws-policies/s3-policies/bc-aws-s3-20

                5  |     "ServerlessDeploymentBucket": {
                6  |       "Type": "AWS::S3::Bucket",
                7  |       "Properties": {
                8  |         "BucketEncryption": {
                9  |           "ServerSideEncryptionConfiguration": [
                10 |             {
                11 |               "ServerSideEncryptionByDefault": {
                12 |                 "SSEAlgorithm": "AES256"
                13 |               }
                14 |             }
                15 |           ]
                16 |         }
                17 |       }
                18 |     },

Check: CKV_AWS_56: "Ensure S3 bucket has RestrictPublicBuckets enabled"
        FAILED for resource: AWS::S3::Bucket.ServerlessDeploymentBucket
        File: /tmp/sls/cloudformation-template-create-stack.json:5-18
        Guide: https://docs.prismacloud.io/en/enterprise-edition/policy-reference/aws-policies/s3-policies/bc-aws-s3-22

                5  |     "ServerlessDeploymentBucket": {
                6  |       "Type": "AWS::S3::Bucket",
                7  |       "Properties": {
                8  |         "BucketEncryption": {
                9  |           "ServerSideEncryptionConfiguration": [
                10 |             {
                11 |               "ServerSideEncryptionByDefault": {
                12 |                 "SSEAlgorithm": "AES256"
                13 |               }
                14 |             }
                15 |           ]
                16 |         }
                17 |       }
                18 |     },

Check: CKV_AWS_53: "Ensure S3 bucket has block public ACLs enabled"
        FAILED for resource: AWS::S3::Bucket.ServerlessDeploymentBucket
        File: /tmp/sls/cloudformation-template-create-stack.json:5-18
        Guide: https://docs.prismacloud.io/en/enterprise-edition/policy-reference/aws-policies/s3-policies/bc-aws-s3-19

                5  |     "ServerlessDeploymentBucket": {
                6  |       "Type": "AWS::S3::Bucket",
                7  |       "Properties": {
                8  |         "BucketEncryption": {
                9  |           "ServerSideEncryptionConfiguration": [
                10 |             {
                11 |               "ServerSideEncryptionByDefault": {
                12 |                 "SSEAlgorithm": "AES256"
                13 |               }
                14 |             }
                15 |           ]
                16 |         }
                17 |       }
                18 |     },



✔ Checkov analysis completed successfully.

✔ Service packaged (12s)
```

## Contributing

If you have suggestions for how this app could be improved, or
want to report a bug, open an issue - we'd love all and any
contributions.

## License

Apache License 2.0 © 2024 Mridang Agarwalla
