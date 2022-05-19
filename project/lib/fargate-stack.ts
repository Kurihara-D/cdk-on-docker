import { Stack, StackProps } from "aws-cdk-lib";
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { EcsCluster } from './resources/ecsAsset/ecsCluster';
import { EcsIam } from "./resources/ecsAsset/ecsIam";
import { TaskDefinition } from "./resources/ecsAsset/taskDefinition";
import { CommonLogGroup } from "./resources/commonLogGroup";
import { DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { CfnReplicationGroup } from "aws-cdk-lib/aws-elasticache";
import { AppContainerDefinition } from "./resources/ecsAsset/appContainerDefinition";
import { AlbFargateService } from "./resources/ecsAsset/albFargateService";

import { SecurityGroup, Peer, Port } from "aws-cdk-lib/aws-ec2";


export class FargateStack extends Stack {
    constructor(scope: Construct, id: string, vpc: Vpc, rds: DatabaseInstance, elastiCache: CfnReplicationGroup, props?: StackProps) {
        super(scope, id, props)

        // public subnetだから別にいらない
        let albSg = new SecurityGroup(this, "albSg", { vpc, allowAllOutbound: true });

        albSg.addIngressRule(Peer.anyIpv4(), Port.tcp(80));

        const ecsCluster = new EcsCluster(vpc)
        ecsCluster.createResources(this)
        
        const ecsIam = new EcsIam()
        ecsIam.createResources(this)

        const taskDefinition = new TaskDefinition(ecsIam.ecsTaskExecutionRole)
        taskDefinition.createResources(this)

        const ecsLogGroup = new CommonLogGroup('app-nginx')
        ecsLogGroup.createResources(this)

        const appContainerDef = new AppContainerDefinition(taskDefinition.taskDef, ecsLogGroup.logGrp, rds, elastiCache)
        appContainerDef.createResources(this)

        const albFargateService = new AlbFargateService(ecsCluster.cluster, taskDefinition.taskDef, [albSg], vpc)
        albFargateService.createResources(this)
        
    }
}

