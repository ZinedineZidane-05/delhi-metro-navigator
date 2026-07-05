package com.metro.model;
import java.util.ArrayList;
import java.util.List;
public class RouteRequest {
    private String source;
    private String destination;
    private List<String> blockedStations = new ArrayList<>();
    public RouteRequest() {}
    public String getSource() { return source; }
    public void setSource(String s) { this.source = s; }
    public String getDestination() { return destination; }
    public void setDestination(String d) { this.destination = d; }
    public List<String> getBlockedStations() { return blockedStations; }
    public void setBlockedStations(List<String> b) { this.blockedStations = b; }
}
