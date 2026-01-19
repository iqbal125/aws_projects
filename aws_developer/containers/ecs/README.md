# ECS (Elastic Container Service)

Fully managed container orchestration service for deploying, managing, and scaling containerized applications. Supports Docker containers and integrates with AWS services.




A task placement strategy is an algorithm for selecting instances for task placement or tasks for termination. Task placement strategies can be specified when either running a task or creating a new service.

Amazon ECS supports the following task placement strategies:

binpack - Place tasks based on the least available amount of CPU or memory. This minimizes the number of instances in use.

random - Place tasks randomly.

spread - Place tasks evenly based on the specified value. Accepted values are attribute key-value pairs, instanceId, or host. 


References:

https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-placement.html

https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-placement-strategies.html

https://aws.amazon.com/blogs/compute/amazon-ecs-task-placement/

 

Check out this Amazon ECS Cheat Sheet:

https://tutorialsdojo.com/amazon-elastic-container-service-amazon-ecs/