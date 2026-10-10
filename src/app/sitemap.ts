import type {MetadataRoute} from "next";
import {guides} from "@/content/docs";
import {legalPages} from "@/content/legal";
export default function sitemap():MetadataRoute.Sitemap{return ["","/vision","/waitlist","/doc","/product/pre-flight-cli","/legal",...legalPages.map(p=>p.href),...guides.map(g=>`/doc/${g.slug}`)].map(path=>({url:`https://nodedots.com${path}`,changeFrequency:path===""||path==="/doc"?"weekly":"monthly",priority:path===""?1:path==="/waitlist"?.9:path.startsWith("/doc")?.7:.3}));}
