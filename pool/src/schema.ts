import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefinitions = `enum DesireType {
    NEEDS
    HAS
}

type Query {
    dining_halls: [DiningHall]!
}

type DiningHall {
    name: String!
    hours_today: TimeInterval
    open: Boolean
    current_desires: [Desire]!
}

type Desire {
    user: User!
    type: DesireType
    valid_times: TimeInterval
}

type User {
    name: String!
}

type TimeInterval {
    start: Int
    end: Int
}`;

const resolvers = {
	Query: {

	}
};

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
});
