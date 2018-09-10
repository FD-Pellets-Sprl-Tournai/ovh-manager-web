angular.module('App').controller(
  'HostingTabLocalSeoCtrl',
  class HostingTabLocalSeoCtrl {
    constructor($q, $scope, $stateParams, $translate, $window, Alerter, Domain, HostingLocalSeo, User) {
      this.$q = $q;
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.$window = $window;
      this.Alerter = Alerter;
      this.Domain = Domain;
      this.HostingLocalSeo = HostingLocalSeo;
      this.User = User;
    }

    $onInit() {
      this.datagridId = 'localSeoDatagrid';
      this.loading = {
        locations: false,
      };
      this.productId = this.$stateParams.productId;
      this.accounts = null;

      this.isAdmin = false;

      this.checkAdmin().then((isAdmin) => {
        this.isAdmin = isAdmin;
      });

      this.HostingLocalSeo.getVisibilityCheckerURL().then((url) => {
        this.visibilityCheckerURL = url;
      });
    }

    checkAdmin() {
      return this.$q
        .all({
          serviceInfo: this.Domain.getServiceInfo(this.productId),
          user: this.User.getUser(),
        })
        .then(({ serviceInfo, user }) => serviceInfo.contactAdmin === user.nichandle)
        .catch((err) => {
          this.Alerter.alertFromSWS(
            this.$scope.tr('common_serviceinfos_error', [this.productId]),
            err,
            this.$scope.alerts.main,
          );
          return false;
        });
    }

    refresh() {
      return this.loadAccounts().then(() => this.loadLocations());
    }

    loadAccounts() {
      return this.getAccounts()
        .then((accounts) => {
          this.accounts = accounts;
        });
    }

    getAccounts() {
      return this.HostingLocalSeo.getAccounts(this.productId)
        .then(accounts => this.$q.all(
          _.map(accounts, account => this.HostingLocalSeo.getAccount(this.productId, account)),
        ));
    }

    loadLocations() {
      this.loading.locations = true;
      return this.$q.when().then(() => {
        if (!_.isEmpty(this.accounts)) {
          return this.getLocations();
        }
        return { data: [], meta: { totalCount: 0 } };
      }).finally(() => {
        this.loading.locations = false;
      });
    }

    getLocations() {
      return this.HostingLocalSeo.getLocations(this.productId)
        .then(locationIds => ({
          data: _.map(locationIds, id => ({ id })),
          meta: {
            totalCount: locationIds.length,
          },
        }));
    }

    hasAccounts() {
      return !_.isEmpty(this.accounts);
    }

    hasLocations() {
      return !_.isEmpty(this.locations);
    }

    transformItem(row) {
      this.loading.locations = true;
      return this.HostingLocalSeo.getLocation(this.productId, row.id)
        .then((result) => {
          const location = angular.copy(result);
          const accountId = _.get(location, 'accountId');
          if (accountId) {
            const account = _.find(this.accounts, { id: accountId });
            if (account) {
              location.account = account;
            }
          }
          return location;
        });
    }

    goToInterface(location) {
      if (!location.accountId) {
        return;
      }

      const lang = _.first(this.$translate.preferredLanguage().split('_'));

      /*
        Opening the window first then setting the location prevents browsers
        from blocking it as a popup.
      */
      const win = this.$window.open('', '_blank');
      win.opener = null;
      this.HostingLocalSeo.login(this.productId, location.accountId)
        .then((token) => {
          win.location = `https://localseo.hosting.ovh.net/${lang}/app/ovh?access_token=${token}`;
        });
    }
  },
);
