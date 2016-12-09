//Define an angular module for our app
var app = angular.module('main-app', ["ngRoute"]);

//Define Routing for app
//Uri /AddNewOrder -> template add_order.html and Controller AddOrderController
//Uri /ShowOrders -> template show_orders.html and Controller AddOrderController
app.config(function ($routeProvider) {
    $routeProvider.
    when('/entry', {
        templateUrl: 'templates/entry.html',
        controller: 'EntryController'
    }).
    when('/details', {
        templateUrl: 'templates/details.html',
        controller: 'DetailsController'
    }).
    otherwise({
        redirectTo: '/entry'
    })
});

var $heading = $("#heading");
app.controller('EntryController', function ($scope, $http) {
    $scope.init = function() {
        $heading.text("Patient Entry");
    }
    
    $scope.doberr = '';
    $scope.dobvalue = '';
    $scope.message = '';
    $scope.error = '';

    var gender = $('select#gender');
    var dob = $("#dob");
    gender.material_select();
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 100, // Creates a dropdown of 15 years to control year
        onSet: function (e) {
            if (!("select" in e))
                return

            $("#age-input").focusin();
            var ageDifMs = Date.now() - new Date(e.select).getTime(); // parse string to date
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            $scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            $scope.$apply()
        }
    });

    $scope.submitForm = function () {
        if (dob.val() == "") {
            dob.click();
            return
        }

        if ($scope.addform.$valid) {
            var data = {
                fname: $scope.fname,
                lname: $scope.lname,
                dob: new Date(dob.val()).yyyymmdd(),
                gender: gender.val(),
                phone: $scope.phone,
                remarks: $scope.remarks
            }
            console.log(data)
            $http({
                method: 'POST',
                url: 'http://localhost:3000/entry',
                data: data
            }).then(function success(res) {
                console.info(res)
                if (res.data.success) {
                    $scope.error = ""
                    $scope.message = res.data.message
                } else {
                    $scope.message = ""
                    $scope.error = res.data.error
                }
            }, function error(res) {
                console.error(res)
            })
        }
        console.warn($scope.addform.$error)
    }
});

app.filter('datefilter', function () {
    return function (datestr) {
        var date
        try {
            date = new Date(datestr)
        } catch (err) {
            return datestr
        }

        return date.toDateString()
    }
})
app.filter('searchFor', function () {

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function (arr, searchString) {

        if (!searchString) {
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function (item) {

            if (item.fname.toLowerCase().indexOf(searchString) !== -1 ||
                item.lname.toLowerCase().indexOf(searchString) !== -1) {
                result.push(item);
            }

        });

        return result;
    };

});
app.filter('agefilter', function () {
    return function (dobstr) {
        var dob
        try {
            dob = new Date(dobstr)
        } catch (err) {
            return dobstr
        }
        
        var ageDifMs = Date.now() - dob.getTime(); // parse string to date
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }
})
app.controller('DetailsController', function ($scope, $http) {
    $scope.init = function() {
        $heading.text("Patient Details");
    }
    
    $scope.data = [];
    $http({
        method: "GET",
        url: 'http://localhost:3000/details',
    }).then(function success(res) {
            console.log(res);
            $scope.data = res.data;
        },
        function error(res) {
            console.error(res)
        });
});

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
        (mm > 9 ? '' : '0') + mm,
        (dd > 9 ? '' : '0') + dd
         ].join('');
};