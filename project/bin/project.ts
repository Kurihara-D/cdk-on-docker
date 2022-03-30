#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MainStack } from '../lib/main-stack';

const app = new cdk.App();
const envType = app.node.tryGetContext("envType");
new MainStack(app, 'MainStack', {
  
  stackName: `main-stack-${envType}`,
  env: { 
    account: '683019620152', 
    region: 'us-east-1' 
  },
});