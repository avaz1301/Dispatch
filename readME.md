# Dispatch - GetSwift Code Test
This project is my submission for the GetSwift code text. It is made to simulate dispatching drones from a depo to deliver packages to their destination on early or on time.
	
## The scenario
Arrive at the depo. Receive a list of packages that must be delivered before a deadline. Assess your drone fleet and match packages to drones that can deliver before the deadline time.

### Implementation
In my attempt to reach a solution, I opted for matching a package to the first drone that was able to deliver on/before the dealine. Here is the breakdown:
	- Retrive list of drones and packages
	- Split drones into 2 groups, free and currently occupied.
	- For each package search thorugh the free drones, find one that can make the delivery on time.
	- If no free drones available, search through occupied drones and find one that can deliver it's current package and then deliver new package on time.

I used a controller to handle all of the drone matching logic exposing only functions that are used to query data from endpoints and used to initialize drone/package matching.

I made a few assumptions for my solution. First, for occupied drones I assumed total delivery time would include delivery of current payload, flight back to the depot and, time to deliver newly assigned package. Second I didnt take into account weather conditions of any sort of flight factors, for simplicity. Third, in assigning a drone to a package I opted to find the first drone that could deliver the package on time, as opposed to finding the fastest drone of the available bunch.

### Why
Why Node? Node is lightweight, fast, and can handle a large number of requests. It gives us the freedom to create a modular project structure and create web applications in a short amount of time. Node also has a vast number modules can can help streamline development. (Ex. Lodash, Async, Bluebird, Axios, etc...) 

I paired the packages and drones in a first fit manner. Why? It made for quicker assignment of drones(marginally). Furthermore, not many factors had to be taken into account and total travel time was the deciding factor in the paring. If other external factors came into play, the travel time alone would not suffice for deciding whether a package could be delivered in time.

Keeping the logic in the backend allows us to keep the data and logic seperate from the front end. Meaning any application that we want to serve the matching data to can be written in any frontend language; even mobile devices.

In terms of the dispatch controller, by sperating out each part of the process we can request packages and drones independently if needed and manupulate that data if necessary. We arent limited to one particular execution method.

Doing this allows the matching process to be executed in a manner that may suit other needs. For my case, I called the methods in sequence to complete the matching process upon user request. Serving the resulting lists.

The matching process can also be called as needed since it isn't dependent on any other function call. This is the advantage seperating functionality.

Occupied drones do appear on the paired list only if they could deliver their current package and the new package on time, it does not mean that the drone has two packages at once

### What would I do differently?
In a ideal situation distance and time are the most important factors. There are a few things I would have implemented differently.

For packages I would have sorted them by time, since for our purposes the deadline was top priority. I would also implement a threshold for how far past the deadline a package can be delivered, this would increase the number of package parings that are possible. In my case, if the drones cannot make it to the destination before the deadline then it cannot be scheduled.

When the drones are being compared, sorting them by "amount of time for delivery" would lead to faster/ earlier deliveries for some packages. In the long run the added sorting could slow down the pairing and leave packages unpaired due to quicker drones being paired off first.
	
Can my solution handle dispatching thousands of jobs per second to thousands of drivers. Right now the answer is no, there are changes that need to be made in oreder to keep up with that level of traffic to the server. The biggest change would be in the way we deliver the scheduled jobs to its respective driver. 

Right now parings ar delivered in bulk, but in a system like that we would need to deliver the assignment to a driver based on a driver Id. Once that is implemented then my soultion may still be viable given a few optimizations for traffic volume and number of calculations.

This is dependent on whether a request for job pairing is done in batches or if they are requested by the driver themselves. Knowing this we can modify the request parameters and format the response appropriately for batch or individual pairings.


### What I used
Javascript -> Node.js backend to handle requests and package calculations
HTML & CSS -> Create minimal frontend to display results
Handlebars -> to pass data from backend to be render on the frontend through templating


Made by Angelo Z.
.....







