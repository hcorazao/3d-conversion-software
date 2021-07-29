# Camera Vendors
## Description
TODO

The currently supported camera vendors are:
* 3Shape
* CEREC
* iTero
* Medit
* Shining 3D


TODO --

## Terms, Definitions & Abbreviations
The following abbreviations & definitions apply to this document:

| Term        | Description |
| ----------- | ----------- |
| Antagonist  | The opposite jaw of preparation.
| GLB         | GLB file format is a binary form of glTF that includes textures instead of referencing them as external images.
| glTF        | glTF (derivative short form of Graphics Library Transmission Format or GL Transmission Format) is a file format for 3D scenes and models using the JSON standard.
| Lower jaw   | In anatomy, the mandible, lower jaw or jawbone is the largest, strongest and lowest bone in the human facial skeleton.
| Mandible    | Same as lower jaw.
| Mandibular  | Mandibular means "related to the mandible (lower jaw bone)".
| Maxilla     | The maxilla in vertebrates is the upper fixed bone of the jaw formed from the fusion of two maxillary bones.
| OBJ         | OBJ is a geometry definition file format first developed by Wavefront Technologies for its Advanced Visualizer animation package.
| PLY         | PLY is a computer file format known as the Polygon File Format or the Stanford Triangle Format.
| Post-op     | Same as preparation, but preparation is more common.
| Pre-op      | Preoperative - the situation before the preparation of the tooth - the same  as Situ. The same jaw as preparation.
| Preparation | The jaw where at least one tooth is preparated, either upper or lower jaw.
| Scan        | One object scanned by an intra-oral camera, e.g. situ scan or lower jaw scan.
| Situ        | Situation - the same as Pre-op.
| STL         | STL is a file format native to the stereolithography CAD software created by 3D Systems.
| Upper jaw   | The maxilla or upper part of the skull of a vertebrate that frames the mouth and holds the teeth.

## Vendors

### 3Shape
3Shape is a developer and manufacturer of 3D scanners and CAD/CAM software solutions for the dental and audio industries based in Copenhagen, Denmark. The company has production facilities and offices in China, Europe, Latin America and the USA.

[Web site](https://www.3shape.com)

### CEREC
CEREC (Chair-side Economical Restoration of Esthetic Ceramics) is a method of CAD/CAM (Computer Aided Design/Computer Aided Manufacturing) dentistry developed by W. Mörmann and M. Brandestini at the University of Zurich in 1980. The CEREC name is also a brand name of the Sirona companies (Sirona Australia, Sirona Germany, Sirona USA, and others), because Sirona grew out of the exclusive licensing of the system by Siemens.

CEREC uses CAD/CAM technology which incorporates a camera, computer, and milling machine into one instrument. The instrument uses a specialty camera that takes a precise 3-D picture of the tooth or space to be restored. The optical impression is transferred and displayed on a color computer screen where the accredited dentist or trained staff virtually design the restoration. Then, the CAM takes over and automatically creates the restoration. The last step is when the newly created restoration is bonded to the surface of the old tooth.This entire process is completed in a single dental appointment.

[Web site](https://my.cerec.com)

### iTero

[Web site](https://www.itero.com)

### Medit
Medit specializes in 3D measurement and CAD/CAM solutions for dental clinics and labs, including intraoral scanners, based on its own patented state-of-the-art technology. We also develop platform solutions for digital dentistry, supporting collaborative workflows.

[Web site](https://www.medit.com)

### Shining 3D

[Web site](https://pre.shining3ddental.com/solution/intraoral-scanner/)

## 3D Data Formats
The different vendors typically all support the three major 3D data formats:
* STL
  * Text
  * Binary
* OBJ
  * Textured
  * Vertex colored
* PLY
  * tbd

In one folder all jaw objects are from the same data format either STL, OBJ or PLY.

### Particularities
* STL has no color information
* Vertex colored OBJ is not an official standard, but widely used and accepted

## Unit
A unit in the model corresponds to a certain actual size in the real world. E.g. `1.0` in a PLY file, corresponds to `1mm` in real world and vice versa. This could be different with different vendors.

## Identify Camera Vendor


| Vendor     | Unit | Case File | Lower Jaw | Upper Jaw | Lower Jaw Pre-op | Upper Jaw Pre-op | STL | OBJ | Additional |
| ---------- | ---- | --------- | --------- | --------- | ---------------- | ---------------- | --- | --- | ---------- |
| 3Shape     |  |  |  |  |  |
| CEREC      |  |  |  |  |  |
| iTero      |  |  |  |  |  |
| Medit      | 1mm | {Case Name}.dentalProject | {Case Name}-lowerjaw.* | {Case Name}-upperjaw.* | {Case Name}-lowerjaw-situ.* | {Case Name}-upperjaw-situ.* | B | VC | Folder name = Case name |
| Shining 3D |  |  |  |  |  |

B: Binary STL</br>
T: Text STL</br>
Tex: Textured OBJ</br>
VC: Vertex colored OBJ

The jaw objects are from one of the three major data formats (see above), e.g. `{Case Name}-lowerjaw.obj`.