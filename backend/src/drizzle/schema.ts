import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(), // auto-incrementing primary key field
  email: text('email').unique(),
  role_id: integer('role_id'),
});

export const user_role = pgTable('user_role', {
  id: serial('id').primaryKey(), // auto-incrementing primary key field
  name: text('name'),
});

export const usersRelations = relations(users, ({ one }) => ({
  user_role: one(user_role, {
    fields: [users.role_id],
    references: [user_role.id],
  }),
}));
