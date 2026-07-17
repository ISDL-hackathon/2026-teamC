"use client";

import {
  useState,
  useTransition,
} from "react";
import {
  searchPlaces,
  type NominatimPlace,
} from "./actions";
import styles from "./page.module.css";
import EventMap from "@/components/EventMap";


type SelectedPlace = {
  name: string;
  address: string;
  placeId: string;
  latitude: number;
  longitude: number;
};

type LocationSearchProps = {
  initialLocation?: string;
  initialAddress?: string;
  initialPlaceId?: string;
  initialLatitude?: string;
  initialLongitude?: string;
};

function convertToSelectedPlace(
  place: NominatimPlace,
): SelectedPlace {
  return {
    name:
      place.name ??
      place.display_name.split(",")[0],
    address: place.display_name,
    placeId: String(place.place_id),
    latitude: Number(place.lat),
    longitude: Number(place.lon),
  };
}

function createInitialSelectedPlace({
  initialLocation,
  initialAddress,
  initialPlaceId,
  initialLatitude,
  initialLongitude,
}: LocationSearchProps): SelectedPlace | null {
  const latitude = Number(
    initialLatitude,
  );

  const longitude = Number(
    initialLongitude,
  );

  if (
    !initialLocation ||
    !initialAddress ||
    !initialPlaceId ||
    !initialLatitude ||
    !initialLongitude ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    name: initialLocation,
    address: initialAddress,
    placeId: initialPlaceId,
    latitude,
    longitude,
  };
}

export default function LocationSearch({
  initialLocation = "",
  initialAddress = "",
  initialPlaceId = "",
  initialLatitude = "",
  initialLongitude = "",
}: LocationSearchProps) {
  const [
    locationInput,
    setLocationInput,
  ] = useState(initialLocation);

  const [
    searchResults,
    setSearchResults,
  ] = useState<NominatimPlace[]>([]);

  const [
  selectedPlace,
  setSelectedPlace,
] = useState<SelectedPlace | null>(
  () =>
    createInitialSelectedPlace({
      initialLocation,
      initialAddress,
      initialPlaceId,
      initialLatitude,
      initialLongitude,
    }),
);

  const [
    searchError,
    setSearchError,
  ] = useState("");

  const [
    isSearching,
    startSearchTransition,
  ] = useTransition();

  const handleLocationChange = (
    value: string,
  ) => {
    setLocationInput(value);
    setSelectedPlace(null);
    setSearchResults([]);
    setSearchError("");
  };

  const handleSearch = () => {
    const trimmedQuery =
      locationInput.trim();

    if (!trimmedQuery) {
      setSearchError(
        "検索する場所名を入力してください。",
      );
      setSearchResults([]);
      return;
    }

    setSearchError("");
    setSearchResults([]);

    startSearchTransition(async () => {
      const result =
        await searchPlaces(trimmedQuery);

      if (result.error) {
        setSearchError(result.error);
        return;
      }

      setSearchResults(result.places);

      if (result.places.length === 0) {
        setSearchError(
          "場所が見つかりませんでした。別の言葉で検索してください。",
        );
      }
    });
  };

  const handleSelectPlace = (
    place: NominatimPlace,
  ) => {
    const selected =
      convertToSelectedPlace(place);

    setSelectedPlace(selected);
    setLocationInput(selected.name);
    setSearchResults([]);
    setSearchError("");
  };

  return (
    <div className={styles.formGroup}>
      <label htmlFor="location-search">
        場所
        <span>必須</span>
      </label>

      <div className={styles.locationSearchRow}>
        <input
          id="location-search"
          type="text"
          value={locationInput}
          placeholder="例：同志社大学 京田辺キャンパス"
          maxLength={100}
          onChange={(event) =>
            handleLocationChange(
              event.target.value,
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          }}
        />

        <button
          type="button"
          className={styles.locationSearchButton}
          onClick={handleSearch}
          disabled={
            isSearching ||
            locationInput.trim().length === 0
          }
        >
          {isSearching
            ? "検索中..."
            : "検索"}
        </button>
      </div>

      <p className={styles.locationHelpText}>
        場所名を入力して検索し、候補を1件選択してください。
      </p>

      {searchError && (
        <p className={styles.locationSearchError}>
          {searchError}
        </p>
      )}

      {searchResults.length > 0 && (
        <div
          className={styles.locationResults}
          aria-label="場所の検索結果"
        >
          {searchResults.map((place) => (
            <button
              key={place.place_id}
              type="button"
              className={
                styles.locationResultButton
              }
              onClick={() =>
                handleSelectPlace(place)
              }
            >
              <strong>
                {place.name ??
                  place.display_name.split(
                    ",",
                  )[0]}
              </strong>

              <span>
                {place.display_name}
              </span>
            </button>
          ))}
        </div>
      )}

     {selectedPlace && (
  <>
    <div
      className={
        styles.selectedLocation
      }
    >
      <p
        className={
          styles.selectedLocationLabel
        }
      >
        選択中の場所
      </p>

      <strong>
        {selectedPlace.name}
      </strong>

      <span>
        {selectedPlace.address}
      </span>
    </div>

    <div className={styles.mapPreview}>
      <EventMap
        latitude={
          selectedPlace.latitude
        }
        longitude={
          selectedPlace.longitude
        }
      />
    </div>
  </>
)}

      <input
        type="hidden"
        name="location"
        value={
          selectedPlace?.name ?? ""
        }
      />

      <input
        type="hidden"
        name="location_address"
        value={
          selectedPlace?.address ?? ""
        }
      />

      <input
        type="hidden"
        name="location_place_id"
        value={
          selectedPlace?.placeId ?? ""
        }
      />

      <input
        type="hidden"
        name="location_latitude"
        value={
          selectedPlace?.latitude ?? ""
        }
      />

      <input
        type="hidden"
        name="location_longitude"
        value={
          selectedPlace?.longitude ?? ""
        }
      />
    </div>
  );
}