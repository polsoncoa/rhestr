
/**
 * @constructor CustomerService.
 * AngularJS Controller for the customer objects
 */
angular.module('myApp', ['ui.bootstrap']);
function Projects($scope) {
    // constants
    var SEARCH_LIMIT = 10;
    // variable definitions
    $scope.customer = {}; // this object will contain our project data
    $scope.status = '';
    $scope.searchinfo = '';
    $scope.searchtext = '';
    $scope.searchresults = [];

    // instantiate a couchdb client. Create the database url based on our location
    var parts = window.location.href.split('/');
    var attachment = parts.pop();
    var docpart2 = parts.pop();
    var docpart1 =parts.pop();
    var doc = docpart1 + '/' + docpart2;
    var db = parts.pop();
    $.couch.urlPrefix = parts.join('/');
    var couch = $.couch.db(db);
//accordion

  $scope.oneAtATime = true;


  $scope.isCollapsed = false;

    // add a report to the current customer
    $scope.addReport = function () {
        if (!$scope.customer.reports) {
            $scope.customer.reports = [];
        }
        $scope.customer.reports.splice(0, 0, {"date": (new Date()).toDateString()} );
    };

    // remove a report from the current customer
    $scope.removeReport = function (report) {
        if ($scope.customer.reports) {
            var index = $scope.customer.reports.indexOf(report);
            if (index != -1) {
                $scope.customer.reports.splice(index, 1);
            }
        }
    };

    // add a contact to the current customer
    $scope.addContact = function () {
        if (!$scope.customer.contact) {
            $scope.customer.contact = [];
        }
        $scope.customer.contact.push({});
    };

    // remove a contact from the current customer
    $scope.removeContact = function (contact) {
        if ($scope.customer.contact) {
            var index = $scope.customer.contact.indexOf(contact);
            if (index != -1) {
                $scope.customer.contact.splice(index, 1);
            }
        }
    };

    /**
     * Create a new customer (Changes in current customer will not be saved)
     */
    $scope.new = function () {
        $scope.customer = {};
    };

    /**
     * Save the current customer. If new, a new document will be created. Else,
     * the existing document will be updated.
     */
    $scope.save = function () {
        $scope.error = undefined;
        $scope.customer.updated = new Date();
        $scope.status = 'saving...';
        couch.saveDoc($scope.customer, {
            success: function (resp) {
                $scope.status = '';
                $scope.$apply();
                $scope.search();
            },
            error: function (err) {
                $scope.error = err;
                $scope.$apply();
            }
        });
    };

    /**
     * Load a customer by id
     * @param {Number} id
     */
    $scope.load = function (id) {
        $scope.error = undefined;
        $scope.status = 'loading...';
        couch.openDoc(id, {
            success: function (doc) {
                $scope.status = '';
                $scope.customer = doc;
                $scope.$apply();
            },
            error: function (err) {
                $scope.error = undefined;
                $scope.$apply();
            }
        });
    };

    /**
     * delete the currently loaded customer
     */
    $scope.delete = function () {
        $scope.error = undefined;
        if ($scope.customer._id) {
            $scope.status = 'deleting...';
            couch.removeDoc($scope.customer, {
                success: function (doc) {
                    $scope.status = '';
                    $scope.customer = {};
                    $scope.$apply();
                    $scope.search();
                },
                error: function (err) {
                    $scope.error = undefined;
                    $scope.$apply();
                }
            });
        }
        else {
            $scope.customer = {};
        }
    };

    /**
     * Perform a search request to CouchDB.
     * - If searchtext is empty, the most recent documents will be retrieved.
     * - If searchtext is non-empty, documents with matching names will be retrieved.
     */
    $scope.search = function () {
        var searchinfo;

        // callback on search success
        var onSuccess = function (view) {
            $scope.searchlimited = (view.rows.length > SEARCH_LIMIT);
            if ($scope.searchlimited) {
                view.rows.pop();
            }
            $scope.searchinfo = searchinfo;
            $scope.searchresults = view.rows;
            $scope.$apply();
        };

        // callback on search error
        var onError = function (err) {
            var onDesperate = function (err) {
                $scope.error = err;
                $scope.$apply();
            };
/*            if (err == 404) {
                console.log('Search view not found. Creating view...');
                $scope.searchinfo = 'creating view...';
                $scope.$apply();
                $scope.createSearchView({
                    success: $scope.search,
                    error: onDesperate
                });
            }
            else {
                onDesperate(err);
            }*/
        };

        if ($scope.searchtext.length == 0) {
            // load most recent files
            searchinfo = 'most recent files:';
            couch.view('app/recent', {
                descending: true,
                limit: SEARCH_LIMIT,
                success: onSuccess,
                error: onError
            });
        }
        else {
            // load search results
            searchinfo = 'search results:';
            couch.view('app/names', {
                startkey: $scope.searchtext,
                endkey: $scope.searchtext + 'Z',
                limit: (SEARCH_LIMIT + 1),  // +1 so we know if there were more results available
                success: onSuccess,
                error: onError
            });
        }
    };

    /**
     * Create a design document for querying search results, containing two
     * views: documents by name, and by timestamp updated.
     * @param {Object} params      Object containing callback methods 'success'
     *                             and 'error'.
     */
/**    $scope.createSearchView = function (params) {
        var searchview =  {
            '_id': '_design/search',
            'language': 'javascript',
            'views': {
                'names': {
                    'map':
                        (function(doc) {
                            if (doc.name) {
                                emit(doc.name, doc.name);
                            }
                        }).toString()
                },
                'recent': {
                    'map':
                        (function(doc) {
                            if (doc.updated && doc.name) {
                                emit(doc.updated, doc.name);
                            }
                        }).toString()
                }
            }
        };

        $scope.error = undefined;
        $scope.status = 'creating view...';
        couch.saveDoc(searchview, {
            success: function() {
                $scope.status = '';
                $scope.$apply();
                if (params && typeof(params.success) == 'function') {
                    params.success();
                }
            },
            error: function (err) {
                $scope.error = err;
                $scope.$apply();
                if (params && typeof(params.error) == 'function') {
                    params.error();
                }
            }
        });
    };
**/
    // initially load the recent files
    $scope.search();
}

