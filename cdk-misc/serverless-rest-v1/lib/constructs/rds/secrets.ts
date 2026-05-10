import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface SecretsConstructProps {
    /**
     * The name of the secret
     * @default 'aurora-credentials'
     */
    secretName?: string;

    /**
     * The database username
     * @default 'postgres'
     */
    username?: string;

    /**
     * Characters to exclude from the generated password
     * @default '"@/\\'
     */
    excludeCharacters?: string;
}

export class SecretsConstruct extends Construct {
    public readonly secret: secretsmanager.Secret;

    constructor(scope: Construct, id: string, props?: SecretsConstructProps) {
        super(scope, id);

        // Create database credentials
        // TODO: Integrate with AWS SSM Parameter Store for additional security
        this.secret = new secretsmanager.Secret(this, 'DatabaseCredentials', {
            secretName: props?.secretName || 'aurora-credentials',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: props?.username || 'postgres'
                }),
                generateStringKey: 'password',
                excludeCharacters: props?.excludeCharacters || '"@/\\'
            }
        });
    }
}
