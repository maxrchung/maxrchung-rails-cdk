import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as logs from '@aws-cdk/aws-logs';
import * as ssm from '@aws-cdk/aws-ssm';

export class MaxrchungRailsCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'maxrchung-rails', {
      bucketName: 'maxrchung-rails'
    });
    bucket.grantPublicAccess();

    const taskDefinition = new ecs.TaskDefinition(this, 'maxrchung-rails-task', {
      family: 'maxrchung-rails-task',
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
    });

    const logGroup = new logs.LogGroup(this, 'maxrchung-rails-log-group', {
      logGroupName: 'maxrchung-rails-log-group',
      retention: logs.RetentionDays.ONE_MONTH,
    });

    const container = taskDefinition.addContainer('maxrchung-rails-container', {
      containerName: 'maxrchung-rails-container',
      image: ecs.ContainerImage.fromRegistry('maxrchung/maxrchung-rails'),
      environment: {
        AWS_ACCESS_KEY_ID: ssm.StringParameter.valueForStringParameter(this, 'maxrchung-aws-access-key-id'),
        AWS_DEFAULT_REGION: ssm.StringParameter.valueForStringParameter(this, 'maxrchung-aws-default-region'),
        AWS_SECRET_ACCESS_KEY: ssm.StringParameter.valueForStringParameter(this, 'maxrchung-aws-secret-access-key'),
        DATABASE_HOST: ssm.StringParameter.valueForStringParameter(this, 'cloud-database-host'),
        DATABASE_PASSWORD: ssm.StringParameter.valueForStringParameter(this, 'cloud-database-password'),
        SECRET_KEY_BASE: ssm.StringParameter.valueForStringParameter(this, 'maxrchung-rails-secret-key-base'),
      },
      logging: ecs.LogDriver.awsLogs({
        logGroup: logGroup,
        streamPrefix: 'maxrchung-rails-log',
      })
    });

    container.addPortMappings({ containerPort: 3000 });

    const vpc = ec2.Vpc.fromLookup(this, 'cloud-vpc', {
      vpcName: 'cloud-vpc',
    });

    // https://github.com/aws/aws-cdk/issues/11146#issuecomment-943495698
    const cluster = ecs.Cluster.fromClusterAttributes(this, 'cloud-cluster', {
      clusterName: 'cloud-cluster',
      vpc,
      securityGroups: [],
    });

    const fargate = new ecs.FargateService(this, 'maxrchung-rails-fargate', {
      serviceName: 'maxrchung-rails-fargate',
      cluster,
      desiredCount: 1,
      taskDefinition,
      assignPublicIp: true,
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'maxrchung-rails-target-group', {
      targetGroupName: 'maxrchung-rails-target-group',
      port: 3000,
      vpc,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    targetGroup.addTarget(fargate);

    const listener = elbv2.ApplicationListener.fromLookup(this, 'cloud-balancer-listener-https', {
      loadBalancerTags: {
        'balancer-identifier': 'cloud-balancer'
      },
      listenerProtocol: elbv2.ApplicationProtocol.HTTPS,
    });

    listener.addTargetGroups('add-maxrchung-rails-target-group', {
      priority: 100,
      targetGroups: [
        targetGroup
      ],
      conditions: [
        elbv2.ListenerCondition.hostHeaders([
          'maxrchung.com',
          'www.maxrchung.com',
        ]),
      ],
    });
  }
}
