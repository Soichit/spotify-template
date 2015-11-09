
// Create application with dependency 'firebase'
var data;
var baseUrl = 'https://api.spotify.com/v1/search?type=track&query=';
var myApp = angular.module('myApp', ['firebase']);
var trackTitle = "nothing";
var trackArtist = "nobody";
//var trackUrl = "";
//var entireTrack;



// Bind controller, passing in $scope, $firebaseAuth, $firebaseArray, $firebaseObject
myApp.controller('myCtrl', function($http, $scope, $firebaseAuth, $firebaseArray, $firebaseObject){
	
	// Create a variable 'ref' to reference your firebase storage
	var ref = new Firebase('https://soichify.firebaseio.com/');

    // Create references to store tweets and users
    var tweetsRef = ref.child('tweets');
    var usersRef = ref.child("users");

    // Create a firebaseArray of your tweets, and store this as part of $scope
    $scope.tweets = $firebaseArray(tweetsRef);    

    // Create a firebaseObject of your users, and store this as part of $scope
    $scope.users = $firebaseObject(usersRef);

	// Create authorization object that referes to firebase
	$scope.authObj = $firebaseAuth(ref);

	// Test if already logged in
	var authData = $scope.authObj.$getAuth();
	if (authData) {
		$scope.userId = authData.uid;
	} 

	// SignUp function
	$scope.signUp = function() {
		// Create user
		$scope.authObj.$createUser({
			email: $scope.email,
			password: $scope.password, 			
		})

		// Once the user is created, call the logIn function
		.then($scope.logIn)

		// Once logged in, set and save the user data
		.then(function(authData) {
			$scope.userId = authData.uid;
			$scope.users[authData.uid] ={
				username:$scope.handle, 
				userImage:$scope.userImage,
				email: $scope.email,
				password: $scope.password,
				posts: 0
			}
			$scope.users.$save()
		})

		// Catch any errors
		.catch(function(error) {
			console.error("Error: ", error);
		});
	}

	// SignIn function
	$scope.signIn = function() {
		$scope.logIn().then(function(authData){
			$scope.userId = authData.uid;
		})
	}

	// LogIn function
	$scope.logIn = function() {
		console.log('log in')
		return $scope.authObj.$authWithPassword({
			email: $scope.email,
			password: $scope.password
		})
	}

	// LogOut function
	$scope.logOut = function() {
		$scope.authObj.$unauth()
		$scope.userId = false
	}
//////////////////////////////////////////////////////////////////////////////////


	$scope.audioObject = {}
	$scope.getSongs = function() {
		$http.get(baseUrl + $scope.track).success(function(response){
	 		data = $scope.tracks = response.tracks.items
		})
	}

	$scope.play = function(preview, song) {
		trackTitle = song.name;
		//trackUrl = song.preview_url;
		//entireTrack = song;
		trackArtist = song.artists[0].name;

		if($scope.currentSong == preview) {
	  		$scope.audioObject.pause()
		    $scope.currentSong = false
		    return
		}
		else {
			if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
		    $scope.audioObject = new Audio(preview);
		    $scope.audioObject.play()  
		    $scope.currentSong = preview
		}
	}

////////////////////////////////////////////////////////////////////////////

	$scope.tweet = function(user) {
		//console.log(user.posts);
		user.posts += 1;
		$scope.users.$save(user);


		// Add a new object to the tweets array using the firebaseArray .$add method. 		
		$scope.tweets.$add({
			text:$scope.newTweet, 
			userId:$scope.userId, 
			likes:0,
			time:Firebase.ServerValue.TIMESTAMP,
			song: trackTitle,
			artist: trackArtist
			//url: trackUrl,
			//track: entireTrack
			
		})
		
		// Once the tweet is saved, reset the value of $scope.newTweet to empty string
		.then(function() {
			$scope.newTweet = ''
		})
	}

	// Function to like a tweet
	$scope.like = function(tweet) {
		tweet.likes += 1;
		$scope.tweets.$save(tweet)
	} 
})

