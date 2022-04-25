import { Stack, StackProps } from "aws-cdk-lib"; 
import { Construct } from "constructs";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { CfnReplicationGroup } from "aws-cdk-lib/aws-elasticache";
import { SecurityGroup, Peer, Port } from "aws-cdk-lib/aws-ec2";
import { ReplicationGroup } from "./resources/redisAsset/replicationGroup";
import { EcSubnetGroup } from "./resources/redisAsset/ecSubnetGroup";
import { CommonLogGroup } from "./resources/commonLogGroup";

export class ElastiCacheStack extends Stack {
    public readonly elasiCache: CfnReplicationGroup

    constructor(scope: Construct, id: string, vpc: Vpc, props?: StackProps) {
        super(scope, id, props)

        let sg = new SecurityGroup(this, "elastiCacheSg", {
            vpc: vpc,
            allowAllOutbound: true,
          });

        vpc.selectSubnets( { subnetGroupName: 'app-public' } ).subnets.forEach((x) => {
            sg.addIngressRule(Peer.ipv4(x.ipv4CidrBlock), Port.tcp(6379));
        })

        const logGroup = new CommonLogGroup('elasticache')
        logGroup.createResources(this)

        const subnetGroup = new EcSubnetGroup(vpc, 'elasticache')
        subnetGroup.createResources(this)

        const replicationGroup = new ReplicationGroup(subnetGroup.subnetGroup, logGroup.logGrp.logGroupName, sg)
        replicationGroup.createResources(this)
        this.elasiCache = replicationGroup.replicationGroup
    }
}
