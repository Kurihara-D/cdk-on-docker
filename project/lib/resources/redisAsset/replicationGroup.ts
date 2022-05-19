import { Resource } from "../abstract/resource";
import { Construct } from "constructs";
import { CfnSubnetGroup, CfnReplicationGroup } from "aws-cdk-lib/aws-elasticache";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Tags } from "aws-cdk-lib";

export class ReplicationGroup extends Resource {
    public replicationGroup: CfnReplicationGroup;

    private readonly subnetGroup: CfnSubnetGroup;
    private readonly logGroupName: string;
    private readonly securityGroup: SecurityGroup;

    constructor(
        subnetGroupName: CfnSubnetGroup,
        logGroupName: string,
        securityGroup: SecurityGroup
      ) {
        super();
        this.subnetGroup = subnetGroupName;
        this.logGroupName = logGroupName;
        this.securityGroup = securityGroup;
    }

    createResources(scope: Construct, resource?: Resource): void {
        const envType = scope.node.tryGetContext("envType");
        let cacheNodeType = "cache.t2.micro"

        envType == "production" 
        ? cacheNodeType = "cache.t3.medium"
        : cacheNodeType
    
        let numCacheClusters = 2  
        let automaticFailoverEnabled = true
        let multiAzEnabled =  true

        if (envType==='staging') {
          numCacheClusters = 1
          automaticFailoverEnabled = false
          multiAzEnabled = false
        }
    
        this.replicationGroup = new CfnReplicationGroup(
          scope,
          `replicationGroup-${envType}`,
          {
            engine: "redis",
            cacheNodeType,
            numCacheClusters,
            multiAzEnabled,
            automaticFailoverEnabled,
            autoMinorVersionUpgrade: true,
            replicationGroupDescription: `replication group for ${envType}`,
            cacheSubnetGroupName: this.subnetGroup.cacheSubnetGroupName,
            securityGroupIds: [this.securityGroup.securityGroupId],
            port: 6379,
            logDeliveryConfigurations: [
                {
                    destinationDetails:{
                        cloudWatchLogsDetails: {
                            logGroup: this.logGroupName,
                        },
                    },
                    destinationType: "cloudwatch-logs",
                    logFormat: "json",
                    logType: "slow-log",
                }
            ]
          }
        );
    
        this.replicationGroup.addDependsOn(this.subnetGroup);
    
        Tags.of(this.replicationGroup).add(
          "Name",
          this.createResourceName(scope, "elastiCacheForRedisCluster")
        );
    }
}