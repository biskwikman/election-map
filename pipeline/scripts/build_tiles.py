import subprocess
from pathlib import Path
import sys

import geopandas as gpd
import openpyxl
import pandas as pd

pd.set_option('display.max_columns', None)

ROOT = Path(__file__).resolve().parents[2]  # election-map/
RAW = ROOT / "pipeline" / "data"
OUT = ROOT / "public" / "tiles"
TMP = RAW / "tmp"
SCRIPTS = Path(__file__).resolve().parent # election-map/pipeline/scripts/

TMP.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

pref_geom_path = RAW / "N03-20260101_GML/N03-20260101_prefecture.geojson"
pref_municipality_path = RAW / "N03-20260101_GML/N03-20260101.geojson"
voter_turnout_single_path = RAW / "election_data" / "20260802_voter_turnout_pref_single.xlsx"
voter_turnout_proportional_path = RAW / "election_data" / "20260802_voter_turnout_pref_proportional.xlsx"
party_votes_by_pref_single_path = RAW / "election_data" / "20260802_party_votes_by_pref_single.xlsx"
party_votes_by_pref_district_proportional_path = RAW / "election_data" / "20260802_party_votes_by_pref_district_proportional.xlsx"


wb = openpyxl.load_workbook(voter_turnout_single_path)
ws = wb.active

print("loading voter turnout data...")
df_pref_turnout_single = pd.DataFrame(
    {
        "pref_name": [cell.value for cell in ws["A"][6:]],
        "men_turnout_single_2026": [cell.value for cell in ws["B"][6:]],
        "women_turnout_single_2026": [cell.value for cell in ws["C"][6:]],
        "total_turnout_single_2026": [cell.value for cell in ws["D"][6:]],
    }
)
wb.close()

wb = openpyxl.load_workbook(voter_turnout_proportional_path)
ws = wb.active

pref_names = [cell.value for cell in ws["B"][5:]]
idxs_to_drop =[i for i, x in enumerate(pref_names) if x in ["計", "合計"]]
pref_names = [item for idx, item in enumerate(pref_names) if idx not in idxs_to_drop]
df_pref_turnout_proportional = pd.DataFrame(
    {
        "pref_name": pref_names,
        "men_turnout_proportional_2026": [item for idx, item in enumerate([cell.value for cell in ws["C"][5:]]) if idx not in idxs_to_drop],
        "women_turnout_proportional_2026": [item for idx, item in enumerate([cell.value for cell in ws["D"][5:]]) if idx not in idxs_to_drop],
        "total_turnout_proportional_2026": [item for idx, item in enumerate([cell.value for cell in ws["E"][5:]]) if idx not in idxs_to_drop],
    }
)
wb.close()

print("loading party votes data...")
# Prefecture level single votes
wb = openpyxl.load_workbook(party_votes_by_pref_single_path)
ws = wb.active

df_pref_party_votes_single = pd.DataFrame(
    {
        "pref_name": [cell.value for cell in ws["A"][5:52]],
        "自由民主党": [cell.value for cell in ws["D"][5:52]],
        "中道改革連合": [cell.value for cell in ws["G"][5:52]], 
        "日本維新の会": [cell.value for cell in ws["J"][5:52]], 
        "国民民主党": [cell.value for cell in ws["M"][5:52]], 
        "参政党": [cell.value for cell in ws["D"][58:105]], 
        "日本共産党": [cell.value for cell in ws["G"][58:105]], 
        "令和新選組": [cell.value for cell in ws["J"][58:105]], 
        "減税日本・ゆうこく連合": [cell.value for cell in ws["M"][58:105]], 
        "日本保守党": [cell.value for cell in ws["D"][111:158]], 
        "社会民主党": [cell.value for cell in ws["G"][111:158]], 
        "チームみらい": [cell.value for cell in ws["J"][111:158]], 
        "無所属": [cell.value for cell in ws["M"][111:158]], 
        "諸派": [cell.value for cell in ws["D"][164:211]], 
    }
)
wb.close()

df_pref_party_votes_single["most_votes"] = df_pref_party_votes_single.iloc[:, 1:-1].idxmax(axis=1)
df_pref_party_votes_single = df_pref_party_votes_single.add_suffix("_s").rename(columns={"pref_name_s": "pref_name"})

# Prefecture level proportional votes
wb = openpyxl.load_workbook(party_votes_by_pref_district_proportional_path)
ws = wb.active

df_pref_party_votes_proportional = pd.DataFrame(
    {
        "pref_name": [cell.value for cell in ws["B"][5:61]],
        "自由民主党": [cell.value for cell in ws["C"][5:61]],
        "中道改革連合": [cell.value for cell in ws["D"][5:61]],
        "日本維新の会": [cell.value for cell in ws["E"][5:61]],
        "国民民主党": [cell.value for cell in ws["F"][5:61]],
        "参政党": [cell.value for cell in ws["G"][5:61]],
        "日本共産党": [cell.value for cell in ws["H"][5:61]],
        "令和新選組": [cell.value for cell in ws["C"][65:121]],
        "減税日本・ゆうこく連合": [cell.value for cell in ws["D"][65:121]],
        "日本保守党": [cell.value for cell in ws["E"][65:121]],
        "社会民主党": [cell.value for cell in ws["F"][65:121]],
        "チームみらい": [cell.value for cell in ws["G"][65:121]],
        "安楽死制度を考える会": [cell.value for cell in ws["H"][65:121]],
    }
)
wb.close()

df_pref_party_votes_proportional = df_pref_party_votes_proportional[df_pref_party_votes_proportional["pref_name"] != "計"].reset_index(drop=True)
df_pref_party_votes_proportional["most_votes"] = df_pref_party_votes_proportional.iloc[:, 1:-1].idxmax(axis=1)
df_pref_party_votes_proportional = df_pref_party_votes_proportional.add_suffix("_p").rename(columns={"pref_name_p": "pref_name"})

# Join dfs
df_pref_turnout = df_pref_turnout_single.merge(df_pref_turnout_proportional, on="pref_name")
df_pref_party_votes = df_pref_party_votes_single.merge(df_pref_party_votes_proportional, on="pref_name")

df_voting_data = df_pref_turnout.merge(df_pref_party_votes, on="pref_name")

print("loading prefecture geometry data...")
gdf_pref_geom = gpd.read_file(pref_geom_path)

# Calculate bbox based on all polygons that have the same prefecture name
MAINLAND_ONLY = {"東京都"}
b = gdf_pref_geom.bounds
pref_bounds = b.groupby(gdf_pref_geom["N03_001"]).agg(
    minx=("minx", "min"),
    miny=("miny", "min"),
    maxx=("maxx", "max"),
    maxy=("maxy", "max"),
)

area = gdf_pref_geom.to_crs(6691).area                         # m², JGD2011 / UTM 54N
largest_idx = area.groupby(gdf_pref_geom["N03_001"]).idxmax()  # row of largest polygon per prefecture
for pref in MAINLAND_ONLY:
    pref_bounds.loc[pref] = b.loc[largest_idx[pref]].values

bbox_map = pref_bounds.apply(tuple, axis=1)
gdf_pref_geom["pref_bbox"] = gdf_pref_geom["N03_001"].map(bbox_map)

print("merging data...")
merged_df = gdf_pref_geom.merge(df_voting_data, left_on="N03_001", right_on="pref_name")
print("writing to tmp fgb file...")
fgb_path = TMP / "pref_turnout.fgb"
merged_df.to_file(fgb_path, driver="FlatGeobuf")

print("creating tiles with tippecanoe...")
subprocess.run(
    [SCRIPTS / "utils" / "simplify.sh", fgb_path, OUT / "boundaries_jp.pmtiles"],
    check=True,
)
