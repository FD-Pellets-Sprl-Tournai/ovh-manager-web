/* eslint-disable no-param-reassign */
angular.module('directives').directive('ovhTabs', [
  'Navigator',
  '$rootScope',
  function ovhTabs(Navigator, $rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'components/tabs/tabs.html',
      scope: {
        tabs: '=',
        selectedTab: '=selectedTab',
        productType: '@product',
        setSelectedTab: '=changeTab',
        tr: '=',
        content: '=',
        menu: '=',
      },

      link(scope) {
        scope.isActive = tab => (scope.selectedTab === tab ? 'active' : '');

        scope.execMenuAction = function execMenuAction(action) {
          switch (action.type) {
            case 'SWITCH_TABS':
              scope.setSelectedTab(action.target);
              break;
            case 'ACTION':
              if (angular.isFunction(action.fn)) {
                action.fn.call(this);
              }
              break;
            case 'SELECT_PRODUCT':
              if (action.disabled) {
                return;
              }
              $rootScope.$broadcast('leftNavigation.selectProduct.fromName', {
                name: action.name,
                type: action.productType,
              });
              scope.setSelectedTab(null);
              Navigator.navigate(action.target);
              break;
            default:
              break;
          }
        };
      },
    };
  },
]);
/* eslint-enable no-param-reassign */
