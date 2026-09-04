"use client";
import { useEffect } from "react";
import { migrateFinoraEducationStorage } from "@/lib/migration/finora-education";
export function StorageMigration(){useEffect(()=>{migrateFinoraEducationStorage();},[]);return null;}
