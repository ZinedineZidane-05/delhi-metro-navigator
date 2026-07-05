package com.metro.model;
import java.util.List;
public class PathResponse {
    private String source, destination, fareBreakdown, error;
    private List<String> path, blockedStations;
    private int distance, interchanges, totalStops, fare;
    private double time;
    private boolean alternateRoute;
    public PathResponse() {}
    public String getSource(){return source;} public void setSource(String s){this.source=s;}
    public String getDestination(){return destination;} public void setDestination(String d){this.destination=d;}
    public List<String> getPath(){return path;} public void setPath(List<String> p){this.path=p;}
    public int getDistance(){return distance;} public void setDistance(int d){this.distance=d;}
    public double getTime(){return time;} public void setTime(double t){this.time=t;}
    public int getInterchanges(){return interchanges;} public void setInterchanges(int i){this.interchanges=i;}
    public int getTotalStops(){return totalStops;} public void setTotalStops(int t){this.totalStops=t;}
    public int getFare(){return fare;} public void setFare(int f){this.fare=f;}
    public String getFareBreakdown(){return fareBreakdown;} public void setFareBreakdown(String fb){this.fareBreakdown=fb;}
    public boolean isAlternateRoute(){return alternateRoute;} public void setAlternateRoute(boolean a){this.alternateRoute=a;}
    public List<String> getBlockedStations(){return blockedStations;} public void setBlockedStations(List<String> b){this.blockedStations=b;}
    public String getError(){return error;} public void setError(String e){this.error=e;}
}
