
/**
 * @constructor CustomerService.
 * AngularJS Controller for the project objects
 */
angular.module('myApp', ['ui.bootstrap']);
function Projects($scope) {
    // constants
    var SEARCH_LIMIT = 20;
    // variable definitions
    $scope.project = {}; // this object will contain our project data
    $scope.inspection = {};//inspection data
    $scope.status = '';
    $scope.searchinfo = '';
    $scope.searchtext = '';
    $scope.searchresults = [];
	var projectopen = 0;

    // instantiate a couchdb client. Create the database url based on our location
    var parts = window.location.href.split('/');
    var attachment = parts.pop();
    var docpart2 = parts.pop();
    var docpart1 =parts.pop();
    var doc = docpart1 + '/' + docpart2;
    var db = parts.pop();
    $.couch.urlPrefix = parts.join('/');
    var couch = $.couch.db(db);
    //accordion and toggle buttons
    $scope.oneAtATime = true;
    $scope.isCollapsed = false;
  
    // add a review of inspection report
    $scope.reviewinspection = function () {
        if (!$scope.inspection.review) {
            $scope.inspection.review = [];
            $scope.inspection.review.reviewer = username;
        }
        $scope.inspection.review.splice(0, 0, {"date": (new Date()).toDateString()} );
    };
	
    // add a report to the current project
    $scope.addReport = function () {
        if (!$scope.project.reports) {
            $scope.project.reports = [];
        }
        $scope.project.reports.splice(0, 0, {"date": (new Date()).toDateString()} );
    };

    // remove a report from the current project
    $scope.removeReport = function (report) {
        if ($scope.project.reports) {
            var index = $scope.project.reports.indexOf(report);
            if (index != -1) {
                $scope.project.reports.splice(index, 1);
            }
        }
    };

    // add a contact to the current project
    $scope.addContact = function () {
        if (!$scope.project.contact) {
            $scope.project.contact = [];
        }
        $scope.project.contact.push({});
    };

    // remove a contact from the current project
    $scope.removeContact = function (contact) {
        if ($scope.project.contact) {
            var index = $scope.project.contact.indexOf(contact);
            if (index != -1) {
                $scope.project.contact.splice(index, 1);
            }
        }
    };

    /**
     * Create a new project (Changes in current project will not be saved)
     */
    $scope.newproject = function () {
        $scope.project = {};
    };
	$scope.newinspection = function () {
        $scope.inspection = {};
    };
    /**
     * Save the current project or inspection report. If new, a new document will be created. Else,
     * the existing document will be updated.
     */
    $scope.saveproject = function () {
        $scope.error = undefined;
        $scope.project.updated = new Date();
		$scope.project.type = "project";
        $scope.status = 'saving...';
        couch.saveDoc($scope.project, {
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
	$scope.saveinspection = function () {
        $scope.error = undefined;
		$scope.inspection.type = "inspection";
		$scope.inspection.inspector = username;
		$scope.inspection.projectid = $scope.project._id;
		$scope.inspection.projectname = $scope.project.name;
        $scope.inspection.updated = new Date();
		$scope.inspection.reviewed = "false";
        $scope.status = 'saving...';
        couch.saveDoc($scope.inspection, {
            success: function (resp) {
                $scope.status = '';
                $scope.$apply();
                $scope.search();
				alert("Inspection Saved");
				$scope.newinspection();
            },
            error: function (err) {
                $scope.error = err;
                $scope.$apply();
            }
        });
    };
	
    /**
     * Load a project or inspection by id
     * @param {Number} id
     */
    $scope.loadproject = function (id) {
        $scope.error = undefined;
        $scope.status = 'loading...';
		couch.openDoc(id, {
            success: function (doc) {
                $scope.status = '';
                $scope.project = doc;
                $scope.$apply();
				projectopen=1;
				console.log(projectopen);
            },
            error: function (err) {
                $scope.error = undefined;
                $scope.$apply();
            }
        });
    };
	$scope.loadinspection = function (id) {
        $scope.error = undefined;
        $scope.status = 'loading...';
        couch.openDoc(id, {
            success: function (doc) {
                $scope.status = '';
                $scope.inspection = doc;
                $scope.$apply();
            },
            error: function (err) {
                $scope.error = undefined;
                $scope.$apply();
            }
        });
    };
    /**
     * delete the currently loaded project
     */
    $scope.deleteproject = function () {
        $scope.error = undefined;
        if ($scope.project._id) {
            $scope.status = 'deleting...';
            couch.removeDoc($scope.project, {
                success: function (doc) {
                    $scope.status = '';
                    $scope.project = {};
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
            $scope.project = {};
        }
    };
	$scope.deleteinspection = function () {
        $scope.error = undefined;
        if ($scope.inspection._id) {
            $scope.status = 'deleting...';
            couch.removeDoc($scope.inspection, {
                success: function (doc) {
                    $scope.status = '';
                    $scope.inspection = {};
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
            $scope.inspection = {};
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

    // initially load the recent files
    $scope.search();
	 /**
     * Perform a search request to CouchDB inspections.
     * - If searchtext is empty, the most recent documents will be retrieved.
     * - If searchtext is non-empty, documents with matching names will be retrieved.**/
     /**
    $scope.searchinspections = function () {
        var searchinspectionsinfo;

        // callback on search success
        var onSuccess = function (view) {
            $scope.searchlimitedinspections = (view.rows.length > SEARCH_LIMIT);
            if ($scope.searchlimitedinspections) {
                view.rows.pop();
            }
            $scope.searchinspectionsinfo = searchinspectionsinfo;
            $scope.searchinspectionsresults = view.rows;
            $scope.$apply();
        };

        // callback on search error
        var onError = function (err) {
            var onDesperate = function (err) {
                $scope.error = err;
                $scope.$apply();
            };
        };

        if ($scope.searchinspectionstext.length == 0) {
            // load most recent files
            searchinspectionsinfo = 'most recent files:';
            couch.view('app/recentinspections', {
                descending: true,
                limit: SEARCH_LIMIT,
                success: onSuccess,
                error: onError
            });
        }
        else {
            // load search results
            searchinspectionsinfo = 'search results:';
            couch.view('app/inspectionsbyinspector', {
                startkey: $scope.searchinspectionstext,
                endkey: $scope.searchinspectionstext + 'Z',
                limit: (SEARCH_LIMIT + 1),  // +1 so we know if there were more results available
                success: onSuccess,
                error: onError
            });
        }
    };

    // initially load the recent files
    $scope.searchinspections();
	**/
}

