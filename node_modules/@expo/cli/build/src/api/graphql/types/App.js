"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppFragmentNode", {
    enumerable: true,
    get: function() {
        return AppFragmentNode;
    }
});
function _core() {
    const data = require("@urql/core");
    _core = function() {
        return data;
    };
    return data;
}
const AppFragmentNode = (0, _core().gql)`
  fragment AppFragment on App {
    id
    scopeKey
    ownerAccount {
      id
      name
    }
  }
`;

//# sourceMappingURL=App.js.map