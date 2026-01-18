import { Table } from 'dynamodb-toolbox';
import { Entity } from 'dynamodb-toolbox';
import documentClient from './dbClient';

import { string, number, schema } from 'dynamodb-toolbox'

// Table definition (v2 style)
export const ECommerceTable = new Table({
    name: process.env.ECOMMERCE_TABLE || 'ECommerceTable',
    documentClient,
    partitionKey: { name: 'PK', type: 'string' },
    sortKey: { name: 'SK', type: 'string' },
    entityAttributeSavedAs: '_et',       // default; you can override if needed
    indexes: {
        GSI1: {
            type: 'global',
            partitionKey: { name: 'GSI1PK', type: 'string' },
            sortKey: { name: 'GSI1SK', type: 'string' },
        },
        // You could add more indexes (GSI2, etc.) similarly
    },
    meta: {
        description: 'Single table for users, orders, products, etc.',
    },
});


// 👤 User Entity
export const User = new Entity({
    name: 'User',
    table: ECommerceTable,
    schema: schema({
        PK: string().partitionKey(),
        SK: string().sortKey(),
        EntityType: string().default('User'),

        userId: string().required(),
        name: string(),
        email: string(),
        createdAt: string().default(() => new Date().toISOString()),

        GSI1PK: string().default('USER'),
        GSI1SK: string().default((data) => `USER#${data.userId}`),
    }),
    // 👇 required: defines how PK/SK are derived when writing
    computeKey: (data) => ({
        PK: `USER#${data.userId}`,
        SK: `PROFILE#${data.userId}`,
    }),
})

// 🧾 Order Entity
export const Order = new Entity({
    name: 'Order',
    table: ECommerceTable,
    schema: schema({
        PK: string().partitionKey(),
        SK: string().sortKey(),
        EntityType: string().default('Order'),

        orderId: string().required(),
        userId: string().required(),
        orderDate: string().required(),
        total: number(),
        status: string().default('PENDING'),

        GSI1PK: string().default('ORDER'),
        GSI1SK: string().default((data) => `${data.orderDate}#${data.orderId}`),
    }),
    computeKey: (data) => ({
        PK: `USER#${data.userId}`,
        SK: `ORDER#${data.orderId}`,
    }),
})

// 📦 OrderItem Entity
export const OrderItem = new Entity({
    name: 'OrderItem',
    table: ECommerceTable,
    schema: schema({
        PK: string().partitionKey(),
        SK: string().sortKey(),
        EntityType: string().default('OrderItem'),

        orderId: string().required(),
        itemId: string().required(),
        productId: string(),
        quantity: number(),
        price: number(),
    }),
    computeKey: (data) => ({
        PK: `ORDER#${data.orderId}`,
        SK: `ITEM#${data.itemId}`,
    }),
})

// 🛒 Product Entity
export const Product = new Entity({
    name: 'Product',
    table: ECommerceTable,
    schema: schema({
        PK: string().partitionKey(),
        SK: string().sortKey(),
        EntityType: string().default('Product'),

        productId: string().required(),
        name: string(),
        price: number(),
        category: string(),
        inventory: number(),

        GSI1PK: string().default((data) => `CATEGORY#${data.category}`),
        GSI1SK: string().default((data) => `PRODUCT#${data.productId}`),
    }),
    computeKey: (data) => ({
        PK: `PRODUCT#${data.productId}`,
        SK: 'DETAILS',
    }),
})
