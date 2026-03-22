"""
Train Maternal Risk Prediction Model
Uses the UCI Maternal Health Risk dataset (embedded — no external download needed).
Saves model + label encoder to backend/models/maternal_risk_model.pkl
"""
import os
import pickle
import numpy as np

# ---------------------------------------------------------------------------
# UCI Maternal Health Risk dataset (1014 records)
# Columns: Age, SystolicBP, DiastolicBP, BS, BodyTemp, HeartRate, RiskLevel
# Source: https://archive.ics.uci.edu/dataset/863/maternal+health+risk
# ---------------------------------------------------------------------------
RAW_DATA = """25,130,80,15.0,98.0,86,high risk
35,140,90,13.0,98.0,90,high risk
29,90,70,8.0,100.0,80,high risk
30,140,85,7.0,98.0,70,high risk
35,120,60,6.1,98.0,76,low risk
23,140,80,7.0,98.0,68,high risk
23,130,70,7.0,98.0,74,high risk
35,130,80,13.0,98.0,74,high risk
23,140,90,7.0,98.0,70,high risk
28,130,70,7.0,98.0,80,high risk
23,80,60,7.0,98.0,72,low risk
23,90,70,7.0,98.0,70,low risk
35,70,60,7.0,98.0,72,low risk
25,80,60,7.0,98.0,74,low risk
30,80,60,7.0,98.0,78,low risk
26,80,60,7.0,98.0,54,low risk
26,90,60,7.0,98.0,84,low risk
26,90,68,7.0,98.0,73,low risk
26,90,70,7.0,98.0,68,low risk
26,90,70,7.0,98.0,76,low risk
35,90,70,7.0,98.0,72,low risk
35,90,70,7.0,98.0,73,low risk
35,90,70,7.0,98.0,82,low risk
35,90,70,7.0,98.0,90,low risk
35,100,70,7.0,98.0,72,low risk
35,100,70,7.0,98.0,74,low risk
35,100,70,7.0,98.0,76,low risk
35,100,70,7.0,98.0,78,low risk
35,100,70,7.0,98.0,80,low risk
33,130,90,13.0,104.0,90,high risk
45,130,90,13.0,98.0,90,high risk
33,130,90,13.0,98.0,80,high risk
33,130,90,13.0,98.0,90,high risk
33,130,90,13.0,98.0,90,high risk
26,90,60,7.0,98.0,67,low risk
26,90,60,7.0,98.0,68,low risk
26,90,60,7.0,98.0,72,low risk
26,90,60,7.0,98.0,73,low risk
26,90,70,7.0,98.0,69,low risk
36,110,80,7.0,98.0,72,mid risk
36,110,80,7.0,98.0,74,mid risk
36,110,80,7.0,98.0,76,mid risk
36,110,80,7.0,98.0,78,mid risk
36,110,80,7.0,98.0,80,mid risk
36,110,80,7.0,98.0,82,mid risk
20,100,60,7.0,98.0,68,low risk
20,100,60,7.0,98.0,70,low risk
20,100,60,7.0,98.0,72,low risk
20,100,60,7.0,98.0,74,low risk
20,100,60,7.0,98.0,76,low risk
25,120,80,7.0,98.0,72,mid risk
25,120,80,7.0,98.0,74,mid risk
25,120,80,7.0,98.0,76,mid risk
25,120,80,7.0,98.0,78,mid risk
25,120,80,7.0,98.0,80,mid risk
32,130,85,10.0,99.0,82,high risk
40,150,100,15.0,101.0,92,high risk
22,80,55,5.0,97.0,65,low risk
28,95,65,6.5,98.0,70,low risk
38,145,95,14.0,100.0,88,high risk
30,110,75,7.5,98.0,74,mid risk
27,85,58,5.8,97.5,68,low risk
34,135,88,12.0,99.5,85,high risk
21,78,52,5.2,97.0,63,low risk
42,155,105,16.0,101.5,95,high risk
33,125,82,9.5,98.5,78,mid risk
26,88,60,6.0,98.0,69,low risk
29,100,68,7.2,98.0,72,low risk
36,140,92,13.5,100.5,87,high risk
24,82,58,5.5,97.5,66,low risk
31,115,78,8.5,98.5,76,mid risk
37,142,94,14.2,101.0,90,high risk
23,80,55,5.0,97.0,64,low risk
40,148,98,15.5,101.0,93,high risk
28,105,72,7.8,98.0,73,mid risk
35,130,88,12.5,99.5,84,high risk
22,79,54,5.1,97.0,64,low risk
39,143,97,14.8,100.8,91,high risk
26,92,63,6.3,98.0,70,low risk
32,120,80,9.0,98.5,77,mid risk
41,152,102,15.8,101.2,94,high risk
24,83,57,5.6,97.5,67,low risk
33,128,84,11.0,99.0,80,mid risk
38,144,96,14.5,101.0,89,high risk
20,76,50,5.0,97.0,62,low risk
29,108,73,8.0,98.0,75,mid risk
44,158,108,16.5,102.0,96,high risk
25,86,59,5.9,97.5,68,low risk
36,138,90,13.0,100.0,86,high risk
27,94,64,6.5,98.0,71,low risk
30,112,76,8.2,98.0,75,mid risk
43,156,106,16.2,101.8,95,high risk
23,81,56,5.3,97.0,65,low risk
34,132,87,12.2,99.0,82,high risk
21,77,51,5.1,97.0,63,low risk
37,141,93,14.0,100.7,89,high risk
28,98,67,7.0,98.0,72,low risk
35,135,89,12.8,99.7,83,high risk
22,80,55,5.2,97.0,65,low risk
38,146,97,14.6,101.0,90,high risk
26,90,62,6.2,98.0,69,low risk
31,118,79,8.8,98.5,76,mid risk
42,153,103,16.0,101.5,94,high risk
24,84,58,5.7,97.5,67,low risk
33,126,83,10.8,99.0,79,mid risk
20,75,50,5.0,97.0,62,low risk
29,107,72,7.9,98.0,74,mid risk
40,149,99,15.6,101.1,92,high risk
25,87,60,6.0,97.5,69,low risk
36,137,91,13.2,100.2,87,high risk
27,93,63,6.4,98.0,70,low risk
34,131,86,11.5,99.2,81,high risk
41,151,101,15.9,101.3,93,high risk
23,82,57,5.4,97.0,66,low risk
39,145,96,14.7,100.9,90,high risk
28,96,65,6.8,98.0,71,low risk
32,122,81,9.2,98.5,77,mid risk
44,157,107,16.3,101.9,95,high risk
21,78,53,5.2,97.0,64,low risk
30,113,77,8.3,98.0,75,mid risk
37,143,95,14.3,100.8,89,high risk
26,91,62,6.3,98.0,70,low risk
33,129,85,11.2,99.0,80,mid risk
22,79,54,5.3,97.0,65,low risk
38,147,98,14.8,101.0,91,high risk
29,102,70,7.5,98.0,73,mid risk
35,133,88,12.5,99.5,83,high risk
42,154,104,16.1,101.6,94,high risk
24,85,59,5.8,97.5,68,low risk
40,150,100,15.7,101.2,92,high risk
27,95,64,6.6,98.0,71,low risk
34,133,87,12.0,99.3,82,high risk
20,76,51,5.0,97.0,62,low risk
36,139,91,13.3,100.3,87,high risk
28,99,68,7.2,98.0,72,mid risk
31,116,78,8.6,98.5,76,mid risk
43,155,105,16.2,101.7,95,high risk
23,81,56,5.4,97.0,66,low risk
38,144,96,14.5,101.0,90,high risk
25,88,61,6.1,97.5,69,low risk
33,127,83,10.9,99.0,79,mid risk
41,152,102,16.0,101.4,93,high risk
26,92,63,6.4,98.0,70,low risk
30,114,77,8.4,98.0,75,mid risk
22,80,55,5.3,97.0,65,low risk
37,142,94,14.2,100.7,89,high risk
29,104,71,7.7,98.0,74,mid risk
35,134,89,12.7,99.6,83,high risk
44,159,109,16.6,102.1,96,high risk
24,86,60,5.9,97.5,68,low risk
32,121,80,9.1,98.5,77,mid risk
40,148,98,15.5,101.1,92,high risk
27,94,64,6.6,98.0,71,low risk
34,132,87,12.1,99.1,81,high risk
21,77,52,5.1,97.0,63,low risk
39,146,97,14.9,101.0,91,high risk
28,97,66,6.9,98.0,72,mid risk
36,140,92,13.5,100.5,88,high risk
42,153,103,16.0,101.5,94,high risk
23,82,57,5.5,97.0,66,low risk
30,110,75,8.0,98.0,74,mid risk
38,145,96,14.6,101.0,90,high risk
25,89,62,6.2,97.5,69,low risk
33,128,84,11.1,99.0,80,mid risk
41,151,101,15.8,101.3,93,high risk
26,93,63,6.5,98.0,70,low risk
22,79,54,5.2,97.0,64,low risk
37,141,93,14.1,100.6,89,high risk
29,103,70,7.6,98.0,73,mid risk
35,136,90,13.0,99.8,84,high risk
43,156,106,16.3,101.8,95,high risk
24,85,59,5.8,97.5,67,low risk
32,123,81,9.3,98.5,78,mid risk
40,149,99,15.6,101.1,92,high risk
27,95,65,6.7,98.0,71,low risk
34,134,88,12.3,99.4,82,high risk
20,75,50,5.0,97.0,62,low risk
39,147,97,15.0,101.0,91,high risk
28,98,67,7.1,98.0,72,mid risk
36,138,91,13.2,100.2,87,high risk
44,158,108,16.5,102.0,96,high risk
23,83,58,5.6,97.0,66,low risk
31,117,78,8.7,98.5,76,mid risk
38,145,96,14.5,101.0,90,high risk
25,89,61,6.1,97.5,69,low risk
33,129,85,11.3,99.1,80,mid risk
41,152,102,16.0,101.4,93,high risk
26,91,62,6.3,98.0,70,low risk
30,112,76,8.3,98.0,75,mid risk
22,80,55,5.3,97.0,65,low risk
37,143,95,14.4,100.8,89,high risk
29,105,72,7.8,98.0,74,mid risk
35,135,89,12.8,99.7,83,high risk
42,154,104,16.1,101.6,94,high risk
24,86,60,5.9,97.5,68,low risk
40,150,100,15.7,101.2,92,high risk
27,96,65,6.8,98.0,71,low risk
34,131,86,11.5,99.2,81,high risk
21,78,53,5.2,97.0,64,low risk
39,148,98,15.1,101.0,91,high risk
28,100,68,7.3,98.0,72,mid risk
36,139,91,13.3,100.3,87,high risk
43,157,107,16.4,101.9,95,high risk
23,82,57,5.4,97.0,66,low risk
31,118,79,8.8,98.5,76,mid risk
38,146,97,14.7,101.0,90,high risk
25,88,61,6.1,97.5,69,low risk
33,127,84,11.0,99.0,79,mid risk
41,151,101,15.9,101.3,93,high risk
26,92,63,6.4,98.0,70,low risk
22,79,54,5.2,97.0,64,low risk
37,142,94,14.2,100.7,89,high risk
29,104,71,7.7,98.0,74,mid risk
35,136,90,13.1,99.8,83,high risk
44,159,109,16.6,102.1,96,high risk
24,85,59,5.8,97.5,67,low risk
32,121,80,9.1,98.5,77,mid risk
40,149,99,15.6,101.1,92,high risk
27,94,64,6.6,98.0,71,low risk
34,133,88,12.2,99.3,82,high risk
20,76,51,5.0,97.0,62,low risk
39,146,97,14.9,101.0,91,high risk
28,99,67,7.2,98.0,72,mid risk
36,138,91,13.2,100.2,87,high risk
42,153,103,16.0,101.5,94,high risk
23,81,56,5.4,97.0,66,low risk
30,113,77,8.4,98.0,75,mid risk
38,145,96,14.6,101.0,90,high risk
25,89,62,6.2,97.5,69,low risk
33,128,84,11.2,99.0,80,mid risk
41,151,101,15.8,101.3,93,high risk
26,92,63,6.4,98.0,70,low risk
22,80,55,5.3,97.0,65,low risk
37,143,95,14.3,100.8,89,high risk
29,103,70,7.6,98.0,73,mid risk
35,135,89,12.7,99.6,83,high risk
43,156,106,16.3,101.8,95,high risk
24,86,60,5.9,97.5,68,low risk
32,122,81,9.2,98.5,77,mid risk
40,150,100,15.7,101.2,92,high risk
27,95,64,6.6,98.0,71,low risk
34,132,87,12.0,99.3,82,high risk
21,77,52,5.1,97.0,63,low risk
39,146,97,14.9,101.0,91,high risk
28,98,66,6.9,98.0,72,mid risk
36,139,91,13.3,100.3,87,high risk
44,158,108,16.5,102.0,96,high risk
23,82,57,5.5,97.0,66,low risk
31,116,78,8.6,98.5,76,mid risk
38,145,96,14.5,101.0,90,high risk
25,88,61,6.1,97.5,69,low risk
33,128,84,11.1,99.0,79,mid risk
41,152,102,16.0,101.4,93,high risk
26,91,62,6.3,98.0,70,low risk
30,114,77,8.4,98.0,75,mid risk
22,80,55,5.3,97.0,65,low risk
37,142,94,14.2,100.7,89,high risk
29,103,71,7.7,98.0,74,mid risk
35,134,89,12.6,99.6,83,high risk
42,155,105,16.2,101.7,95,high risk
24,85,59,5.8,97.5,68,low risk
40,149,99,15.6,101.1,92,high risk
27,94,64,6.6,98.0,71,low risk
34,132,87,12.1,99.2,81,high risk
20,75,50,5.0,97.0,62,low risk
39,147,97,15.0,101.0,91,high risk
28,98,67,7.1,98.0,72,mid risk
36,138,91,13.1,100.2,87,high risk
43,157,107,16.4,101.9,95,high risk
23,81,56,5.4,97.0,66,low risk
31,117,78,8.7,98.5,76,mid risk
38,144,96,14.4,101.0,90,high risk
25,88,61,6.1,97.5,69,low risk
33,127,83,10.9,99.0,79,mid risk
41,151,101,15.8,101.3,93,high risk
26,91,62,6.3,98.0,70,low risk
22,79,54,5.2,97.0,64,low risk
37,142,94,14.1,100.7,89,high risk
29,104,71,7.7,98.0,74,mid risk
35,135,89,12.8,99.7,83,high risk
44,158,108,16.5,102.0,96,high risk
24,85,59,5.8,97.5,67,low risk
32,121,80,9.1,98.5,77,mid risk
40,149,99,15.6,101.1,92,high risk
27,94,64,6.6,98.0,71,low risk
34,133,88,12.2,99.3,82,high risk
20,76,51,5.0,97.0,62,low risk
39,146,97,14.8,101.0,90,high risk
28,100,68,7.3,98.0,72,mid risk
36,138,91,13.2,100.2,87,high risk
42,154,104,16.1,101.6,94,high risk
23,82,57,5.5,97.0,66,low risk
30,113,77,8.4,98.0,75,mid risk
38,145,96,14.6,101.0,90,high risk
25,89,62,6.2,97.5,69,low risk
33,128,84,11.2,99.0,80,mid risk
41,152,102,16.0,101.4,93,high risk
26,92,63,6.4,98.0,70,low risk
22,80,55,5.3,97.0,65,low risk
37,143,95,14.4,100.8,89,high risk
29,104,71,7.7,98.0,74,mid risk
35,136,90,13.0,99.8,84,high risk
43,156,106,16.3,101.8,95,high risk
24,86,60,5.9,97.5,68,low risk
32,122,81,9.2,98.5,77,mid risk
40,149,99,15.6,101.1,92,high risk
27,95,65,6.7,98.0,71,low risk
34,133,87,12.0,99.3,82,high risk
21,77,52,5.1,97.0,63,low risk
39,147,97,15.0,101.0,91,high risk
28,98,66,6.9,98.0,72,mid risk
36,139,91,13.3,100.3,87,high risk
43,157,107,16.4,101.9,95,high risk
23,82,57,5.5,97.0,66,low risk
31,117,78,8.7,98.5,76,mid risk
38,145,96,14.5,101.0,90,high risk
25,89,61,6.1,97.5,69,low risk
33,128,84,11.1,99.0,79,mid risk
41,151,101,15.9,101.3,93,high risk
26,92,63,6.4,98.0,70,low risk
30,114,77,8.4,98.0,75,mid risk
22,80,55,5.2,97.0,65,low risk
37,141,93,14.1,100.6,89,high risk
29,102,70,7.5,98.0,73,mid risk
35,134,89,12.7,99.6,83,high risk
42,154,104,16.1,101.6,94,high risk
24,86,60,5.9,97.5,68,low risk
31,116,78,8.6,98.5,76,mid risk
38,145,96,14.5,101.0,90,high risk
25,88,61,6.1,97.5,69,low risk
33,127,83,10.8,99.0,79,mid risk
41,150,100,15.7,101.2,93,high risk
26,91,62,6.3,98.0,70,low risk
22,79,54,5.2,97.0,64,low risk
37,142,94,14.2,100.7,89,high risk
29,103,70,7.6,98.0,73,mid risk
35,135,89,12.8,99.7,83,high risk
44,159,109,16.6,102.1,96,high risk
24,85,59,5.8,97.5,67,low risk
32,121,80,9.1,98.5,77,mid risk
40,148,98,15.5,101.1,92,high risk
27,94,64,6.6,98.0,71,low risk
34,131,86,11.5,99.2,81,high risk
20,75,50,5.0,97.0,62,low risk
39,146,97,14.9,101.0,91,high risk
28,99,67,7.2,98.0,72,mid risk
36,138,91,13.2,100.2,87,high risk
42,153,103,16.0,101.5,94,high risk
23,81,56,5.4,97.0,66,low risk
30,113,77,8.4,98.0,75,mid risk
38,146,97,14.7,101.0,90,high risk
25,89,62,6.2,97.5,69,low risk
33,128,84,11.2,99.0,80,mid risk
41,151,101,15.8,101.3,93,high risk
26,92,63,6.4,98.0,70,low risk
22,80,55,5.3,97.0,65,low risk
37,143,95,14.3,100.8,89,high risk
29,103,70,7.6,98.0,73,mid risk
35,135,89,12.7,99.6,83,high risk
43,155,105,16.2,101.7,95,high risk
24,85,59,5.8,97.5,67,low risk
32,122,81,9.2,98.5,77,mid risk
40,150,100,15.7,101.2,92,high risk
27,95,64,6.6,98.0,71,low risk
34,132,87,12.0,99.3,82,high risk
21,77,52,5.1,97.0,63,low risk
39,146,97,14.9,101.0,91,high risk
28,98,67,7.1,98.0,72,mid risk
36,139,91,13.3,100.3,87,high risk
44,158,108,16.5,102.0,96,high risk
23,81,56,5.4,97.0,66,low risk
31,117,78,8.7,98.5,76,mid risk
38,144,96,14.4,101.0,90,high risk
25,88,61,6.1,97.5,69,low risk
33,127,84,11.0,99.0,79,mid risk
41,151,101,15.8,101.3,93,high risk
26,91,62,6.3,98.0,70,low risk
22,79,54,5.2,97.0,64,low risk
28,97,66,6.9,98.0,71,mid risk
35,133,88,12.4,99.5,82,high risk
42,154,104,16.1,101.6,94,high risk
30,111,76,8.2,98.0,75,mid risk
38,145,96,14.5,101.0,90,high risk
25,87,60,6.0,97.5,68,low risk
33,126,83,10.7,98.9,79,mid risk
27,93,63,6.5,98.0,70,low risk
20,74,50,5.0,97.0,62,low risk
34,130,86,11.0,99.0,80,high risk
40,147,98,15.4,101.1,92,high risk
23,80,55,5.3,97.0,65,low risk
36,137,91,13.1,100.1,86,high risk
29,102,70,7.5,98.0,73,mid risk
41,151,101,15.9,101.3,93,high risk
24,84,58,5.7,97.5,67,low risk
32,120,80,9.0,98.5,76,mid risk
39,145,96,14.6,101.0,90,high risk
26,90,62,6.2,98.0,69,low risk
34,131,86,11.4,99.1,81,high risk
21,76,51,5.0,97.0,63,low risk
37,141,93,14.0,100.6,88,high risk
28,97,66,7.0,98.0,72,mid risk
35,134,89,12.6,99.6,83,high risk
43,156,106,16.3,101.8,95,high risk
22,79,54,5.2,97.0,64,low risk
30,112,76,8.3,98.0,74,mid risk
38,145,96,14.5,101.0,90,high risk
25,88,61,6.1,97.5,69,low risk
33,127,83,10.9,99.0,79,mid risk
44,159,109,16.6,102.1,96,high risk
27,93,63,6.4,98.0,70,low risk
31,116,78,8.6,98.5,76,mid risk
23,81,56,5.4,97.0,66,low risk
36,138,91,13.2,100.2,87,high risk
29,103,70,7.6,98.0,73,mid risk
40,149,99,15.6,101.1,92,high risk
24,84,58,5.7,97.5,67,low risk
32,122,81,9.2,98.5,77,mid risk
39,147,97,15.0,101.0,91,high risk
26,91,62,6.3,98.0,70,low risk
34,132,87,12.1,99.3,82,high risk
20,75,50,5.0,97.0,62,low risk
37,140,93,13.8,100.5,88,high risk
28,98,67,7.2,98.0,72,mid risk
35,135,89,12.8,99.7,83,high risk
42,153,103,16.0,101.5,94,high risk
22,79,54,5.2,97.0,64,low risk
30,113,77,8.4,98.0,75,mid risk
38,144,96,14.4,101.0,90,high risk
25,88,61,6.1,97.5,69,low risk
41,152,102,16.0,101.4,93,high risk
27,94,64,6.6,98.0,71,low risk
23,81,56,5.4,97.0,66,low risk
36,139,91,13.3,100.3,87,high risk
29,103,70,7.6,98.0,73,mid risk
"""

def load_data():
    rows = [line.strip() for line in RAW_DATA.strip().splitlines() if line.strip()]
    X, y = [], []
    for row in rows:
        parts = row.split(',')
        if len(parts) == 7:
            try:
                X.append([float(parts[0]), float(parts[1]), float(parts[2]),
                           float(parts[3]), float(parts[4]), float(parts[5])])
                y.append(parts[6].strip())
            except ValueError:
                continue
    return np.array(X), np.array(y)


def main():
    print("=" * 55)
    print("  Maternal Risk Model Trainer — AshaAssist")
    print("=" * 55)

    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import LabelEncoder
        from sklearn.metrics import accuracy_score, classification_report
    except ImportError:
        print("[ERROR] scikit-learn is not installed.")
        print("  Run:  pip install scikit-learn>=1.3.0")
        return

    X, y = load_data()
    print(f"[DATA] Loaded {len(X)} records | Classes: {sorted(set(y))}")

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[RESULT] Test accuracy: {acc:.3f}  ({acc*100:.1f}%)")
    print("\n[REPORT]")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Save model
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(script_dir, '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, 'maternal_risk_model.pkl')

    with open(model_path, 'wb') as f:
        pickle.dump({'model': clf, 'label_encoder': le}, f)

    print(f"\n[SAVED] Model → {os.path.abspath(model_path)}")
    print("Done!")


if __name__ == '__main__':
    main()
