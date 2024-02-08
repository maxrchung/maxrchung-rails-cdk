import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'

export class MaxrchungRailsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const bucket = new s3.Bucket(this, 'maxrchung-rails', {
      bucketName: 'maxrchung-rails'
    })

    new cloudfront.Distribution(this, 'maxrchung-cloudfront', {
      defaultBehavior: { origin: new origins.S3Origin(bucket) }
    })

    // Note: It doesn't seem easy to create a nicer alias name. Cloudfront
    // requires you to provide an SSL certificate, and I don't think I want to
    // go that far. I'll look into redirects from Next.js side.
  }
}
