# EC2 Auto Scaling

## Dynamic Scaling

Dynamic scaling scales the capacity of your Amazon EC2 Auto Scaling group as traffic changes occur.

## Scaling Policy Types

Amazon EC2 Auto Scaling supports the following types of dynamic scaling policies:

### Target Tracking Scaling

Increase and decrease the current capacity of the group based on an Amazon CloudWatch metric and a target value. It works similar to the way that your thermostat maintains the temperature of your home—you select a temperature and the thermostat does the rest.

### Step Scaling

Increase and decrease the current capacity of the group based on a set of scaling adjustments, known as step adjustments, that vary based on the size of the alarm breach.

### Simple Scaling

Increase and decrease the current capacity of the group based on a single scaling adjustment, with a cooldown period between each scaling activity.

https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scale-based-on-demand.html

