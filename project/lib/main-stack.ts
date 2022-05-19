import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcStack } from './vpc-stack';
import { BastionStack } from './bastion-stack';
import { RdsStack } from './rds-stack';
import { ElastiCacheStack } from './elasti-cache-stack';
import { FargateStack } from './fargate-stack';

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const envType = scope.node.tryGetContext("envType");

    const vpcStack = new VpcStack(scope, 'VpcStack', {
        stackName: `vpc-stack-${envType}`
      });

    new BastionStack(scope, 'BastionStack', vpcStack.vpc, {
        stackName: `bastion-stack-${envType}`
    })

    const rdsStack = new RdsStack(scope, 'RdsStack', vpcStack.vpc, {
        stackName: `rds-stack-${envType}`
    })

    const elastiCacheStack = new ElastiCacheStack(scope, 'ElastiCacheStack', vpcStack.vpc, {
      stackName: `elasti-cache-satck-${envType}`
    })

    new FargateStack(scope,'FargateStack', vpcStack.vpc, rdsStack.rds, elastiCacheStack.elasiCache, {
      stackName: `fargate-stack-${envType}`
    })
  }
}
