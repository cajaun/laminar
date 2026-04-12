"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserQuery", {
    enumerable: true,
    get: function() {
        return UserQuery;
    }
});
function _core() {
    const data = require("@urql/core");
    _core = function() {
        return data;
    };
    return data;
}
const _client = require("../client");
const UserQuery = {
    async currentUserAsync () {
        const data = await (0, _client.withErrorHandlingAsync)(_client.graphqlClient.query((0, _core().gql)`
            query CurrentUser {
              meActor {
                __typename
                id
                ... on UserActor {
                  primaryAccount {
                    id
                  }
                  username
                }
                ... on Robot {
                  firstName
                }
                accounts {
                  id
                  users {
                    actor {
                      id
                    }
                    permissions
                  }
                }
              }
            }
          `, /* variables */ undefined, {
            additionalTypenames: [
                'User',
                'SSOUser'
            ]
        }).toPromise());
        return data.meActor;
    }
};

//# sourceMappingURL=UserQuery.js.map