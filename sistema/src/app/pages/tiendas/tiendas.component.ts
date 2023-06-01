import { Component, OnInit } from '@angular/core';
import { TiendaService } from 'src/app/services/tienda.service';
import { Tienda } from 'src/app/models/tiendas';

interface MarkerProperties {
  index: number;
  position: google.maps.LatLngLiteral;
  label: google.maps.MarkerLabel;
  title: string;
  info: string;
  marker: google.maps.Marker | null;
}

@Component({
  selector: 'app-tiendas',
  templateUrl: './tiendas.component.html',
  styleUrls: ['./tiendas.component.css'],
})
export class TiendasComponent implements OnInit {
  listTiendas: Tienda[] = [];
  newTienda: any = {};
  selectedTienda: any = {};
  elementos: number = 0;
  latitud: number = -12.03581;
  longitud: number = -76.958392;
  map: google.maps.Map | undefined;

  center: google.maps.LatLngLiteral = { lat: this.latitud, lng: this.longitud };
  mapOptions: google.maps.MapOptions = {
    center: this.center,
    zoom: 15,
    mapTypeControl: false,
  };

  markers: MarkerProperties[] = [];

  constructor(private _tiendaService: TiendaService) {}

  ngOnInit() {
    this.getTiendas();
  }

  handleMapInitialized(map: google.maps.Map) {
    this.map = map;
    this.createMarkers();
  }

  verTiendas() {
    this._tiendaService.getTiendas().subscribe((data) => {
      this.elementos = this.listTiendas.length;
    });
  }

  verTiendaEnMapa(tienda: Tienda) {
    this.mapOptions.center = {
      lat: tienda.latitud,
      lng: tienda.longitud,
    };
    this.map?.setCenter(this.mapOptions.center);
    this.map?.setZoom(15);
  }

  getTiendas() {
    this._tiendaService.getTiendas().subscribe(
      (response) => {
        this.listTiendas = response;

        this.clearMarkers();

        this.listTiendas.forEach((tienda, index) => {
          const nuevoMarker: MarkerProperties = {
            index,
            position: { lat: tienda.latitud, lng: tienda.longitud },
            label: {
              color: 'black',
              text: tienda.tienda,
              fontSize: '20px',
              fontWeight: 'bold',
            },
            title: 'ciudad',
            info: 'ciudad de los reyes',
            marker: null,
          };

          this.markers.push(nuevoMarker);
        });

        this.createMarkers();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  clearMarkers() {
    this.markers.forEach(({ marker }) => {
      if (marker) {
        marker.setMap(null);
      }
    });
    this.markers = [];
  }

  createMarkers() {
    this.markers.forEach(({ position, label }) => {
      const marker = new google.maps.Marker({
        position,
        label,
        map: this.map!,
      });

      const markerIndex = this.markers.findIndex(
        (m) =>
          m.position.lat === position.lat && m.position.lng === position.lng
      );
      if (markerIndex !== -1) {
        this.markers[markerIndex].marker = marker;
      }
    });
  }

  createTienda() {
    this._tiendaService.guardarTienda(this.newTienda).subscribe(
      (response) => {
        this.getTiendas();
        this.newTienda = {};
      },
      (error) => {
        console.log(error);
      }
    );
  }

  updateTienda() {
    this._tiendaService.actualizarTienda(this.selectedTienda).subscribe(
      (response) => {
        this.getTiendas();
        this.selectedTienda = {};
      },
      (error) => {
        console.log(error);
      }
    );
  }

  deleteTienda(tiendaId: any) {
    this._tiendaService.deleteTienda(tiendaId).subscribe(
      (response) => {
        const index = this.listTiendas.findIndex(
          (tienda) => tienda._id === tiendaId
        );
        if (index !== -1) {
          this.listTiendas.splice(index, 1);
        }

        const markerIndex = this.markers.findIndex(
          (marker) => marker.info === tiendaId
        );
        if (markerIndex !== -1) {
          const marker = this.markers[markerIndex].marker;
          if (marker) {
            marker.setMap(null);
          }
          this.markers.splice(markerIndex, 1);
        }

        this.createMarkers();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectTienda(tienda: any) {
    this.selectedTienda = { ...tienda };
  }
}
