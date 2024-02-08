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
      // Note: I'd like to set up a friendly domain just through here but this
      // requires creating a certificate through ACM. I don't think it's worth
      // the effort to go that far so I'm manually just adding a CNAME record
      // in Route53 to map a s3.maxrchung.com domain to Cloudfront's distribution,
      // something like d111111abcdef8.cloudfront.net. For more info:
      // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html
      // domainNames: ["s3.maxrchung.com"]
      defaultBehavior: { origin: new origins.S3Origin(bucket) }
    })
  }
}
