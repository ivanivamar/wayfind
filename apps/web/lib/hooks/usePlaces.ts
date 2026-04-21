"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    type Timestamp,
} from "firebase/firestore";
import {db} from "@/lib/firebase/client";
import {useAuth} from "@/contexts/AuthContext";
import type {PlaceDetails} from "./usePlacesAutocomplete";
import type {LatLng} from "./useGeolocation";

export type SavedPlaceKind = "home" | "work" | "favorite";

export interface SavedPlace {
    /** Firestore doc ID. "__home" / "__work" for slots, auto-id for favorites. */
    id: string;
    kind: SavedPlaceKind;
    googlePlaceId: string;
    displayName: string;
    formattedAddress: string;
    location: LatLng;
    /** User-chosen label (favorites only, optional). */
    label?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

const HOME_DOC_ID = "__home";
const WORK_DOC_ID = "__work";

function placesCol(uid: string) {
    return collection(db, "users", uid, "places");
}

function toPayload(place: PlaceDetails, kind: SavedPlaceKind, label?: string) {
    return {
        kind,
        googlePlaceId: place.placeId,
        displayName: place.displayName,
        formattedAddress: place.formattedAddress,
        location: {lat: place.location.lat, lng: place.location.lng},
        ...(label !== undefined && {label}),
        updatedAt: serverTimestamp(),
    };
}

export function usePlaces() {
    const {user} = useAuth();
    const uid = user?.uid ?? null;

    const [places, setPlaces] = useState<SavedPlace[]>([]);
    const [loading, setLoading] = useState<boolean>(!!uid);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!uid) {
            setPlaces([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const unsub = onSnapshot(
            query(placesCol(uid)),
            (snap) => {
                const rows: SavedPlace[] = snap.docs.map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        kind: data.kind,
                        googlePlaceId: data.googlePlaceId,
                        displayName: data.displayName,
                        formattedAddress: data.formattedAddress,
                        location: data.location,
                        label: data.label,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                    };
                });
                setPlaces(rows);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
        );
        return () => unsub();
    }, [uid]);

    const home = useMemo(() => places.find((p) => p.id === HOME_DOC_ID) ?? null, [places]);
    const work = useMemo(() => places.find((p) => p.id === WORK_DOC_ID) ?? null, [places]);
    const favorites = useMemo(
        () => places.filter((p) => p.kind === "favorite"),
        [places],
    );

    const setSlot = useCallback(
        async (slot: "home" | "work", place: PlaceDetails) => {
            if (!uid) throw new Error("Not signed in");
            const id = slot === "home" ? HOME_DOC_ID : WORK_DOC_ID;
            await setDoc(
                doc(placesCol(uid), id),
                {...toPayload(place, slot), createdAt: serverTimestamp()},
                {merge: true},
            );
        },
        [uid],
    );

    const setHome = useCallback((place: PlaceDetails) => setSlot("home", place), [setSlot]);
    const setWork = useCallback((place: PlaceDetails) => setSlot("work", place), [setSlot]);

    const addFavorite = useCallback(
        async (place: PlaceDetails, label?: string) => {
            if (!uid) throw new Error("Not signed in");
            // Use Google placeId as doc id so re-saving the same place is idempotent.
            await setDoc(
                doc(placesCol(uid), place.placeId),
                {...toPayload(place, "favorite", label), createdAt: serverTimestamp()},
                {merge: true},
            );
        },
        [uid],
    );

    const removePlace = useCallback(
        async (id: string) => {
            if (!uid) throw new Error("Not signed in");
            await deleteDoc(doc(placesCol(uid), id));
        },
        [uid],
    );

    const isFavorited = useCallback(
        (googlePlaceId: string) =>
            favorites.some((f) => f.googlePlaceId === googlePlaceId),
        [favorites],
    );

    return {
        home,
        work,
        favorites,
        all: places,
        loading,
        error,
        setHome,
        setWork,
        addFavorite,
        removePlace,
        isFavorited,
    };
}
