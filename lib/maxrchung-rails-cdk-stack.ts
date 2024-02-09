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

    // Need this for PDF downloader because downloading binary is different
    // than pass through for images I think:
    // https://github.com/diegomura/react-pdf/issues/1253#issuecomment-1026095758
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'maxrchung-headers-policy', {
      responseHeadersPolicyName: 'maxrchung-headers-policy',
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['*'],
        accessControlAllowMethods: ['GET', 'POST'],
        accessControlAllowOrigins: ['*'],
        originOverride: true
      }
    })

    new cloudfront.Distribution(this, 'maxrchung-cloudfront', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        responseHeadersPolicy
      }
    })

    // Note: It doesn't seem easy to create a nicer alias name. Cloudfront
    // requires you to provide an SSL certificate, and I don't think I want to
    // go that far. I'll look into redirects from Next.js side.
  }
}
