package com.metro.controller;
import com.metro.model.*;
import com.metro.service.MetroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MetroController {
    @Autowired private MetroService metroService;

    @GetMapping("/stations") public List<StationInfo> getStations(){return metroService.getStations();}
    @GetMapping("/map") public List<MapEdge> getMap(){return metroService.getMapEdges();}
    @PostMapping("/shortest-distance") public PathResponse dist(@RequestBody RouteRequest r){return metroService.getShortestDistance(r.getSource(),r.getDestination());}
    @PostMapping("/shortest-time") public PathResponse time(@RequestBody RouteRequest r){return metroService.getShortestTime(r.getSource(),r.getDestination());}
    @PostMapping("/shortest-path-distance") public PathResponse pathDist(@RequestBody RouteRequest r){return metroService.getShortestPathByDistance(r.getSource(),r.getDestination());}
    @PostMapping("/shortest-path-time") public PathResponse pathTime(@RequestBody RouteRequest r){return metroService.getShortestPathByTime(r.getSource(),r.getDestination());}
    @PostMapping("/alternate-path-distance") public PathResponse altDist(@RequestBody RouteRequest r){return metroService.getAlternatePathByDistance(r.getSource(),r.getDestination(),r.getBlockedStations());}
    @PostMapping("/alternate-path-time") public PathResponse altTime(@RequestBody RouteRequest r){return metroService.getAlternatePathByTime(r.getSource(),r.getDestination(),r.getBlockedStations());}
}
