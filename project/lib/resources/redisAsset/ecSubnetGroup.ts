import { Resource } from "../abstract/resource";
import { Construct } from "constructs";
import { CfnSubnetGroup } from "aws-cdk-lib/aws-elasticache";
import { Vpc } from "aws-cdk-lib/aws-ec2";

export class EcSubnetGroup extends Resource {
    public subnetGroup: CfnSubnetGroup;
    private readonly vpc: Vpc;
    private subnetGroupName: string;

    constructor(vpc: Vpc, subnetGroupName: string) {
        super();
        this.vpc = vpc;
        this.subnetGroupName = subnetGroupName;
    }

    createResources(scope: Construct): void {
        const envType = scope.node.tryGetContext("envType")

        this.subnetGroup = new CfnSubnetGroup(scope, `${this.subnetGroupName}SubnetGroup`, {
            description: `Subnet Group for Amazon ElastiCahce for Redis ${envType}`,
            cacheSubnetGroupName: `${envType}-${this.subnetGroupName}-subnet-group`,
            subnetIds: this.vpc.selectSubnets({ subnetGroupName: 'elasticache' }).subnetIds
        })
    }
}