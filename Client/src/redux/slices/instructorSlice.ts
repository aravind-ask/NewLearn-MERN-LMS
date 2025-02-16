import {
  CourseCurriculum,
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config/CourseConfigs";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface InstructorState {
//   courseLandingFormData: any;
//   courseCurriculumFormData: any;
//   mediaUploadProgress: boolean;
//   mediaUploadProgressPercentage: number;
//   instructorCoursesList: any[];
//   currentEditedCourseId: string | null;
// }

const initialState = {
  courseLandingFormData: courseLandingInitialFormData,
  courseCurriculumFormData: courseCurriculumInitialFormData,
  mediaUploadProgress: false,
  uploadedVideoUrl: "",
  mediaUploadProgressPercentage: 0,
  instructorCoursesList: [],
  currentEditedCourseId: null,
};

const instructorSlice = createSlice({
  name: "instructor",
  initialState,
  reducers: {
    setCourseLandingFormData: (state, action: PayloadAction<any>) => {
      state.courseLandingFormData = action.payload;
    },
    setCourseCurriculumFormData: (state, action: PayloadAction<any>) => {
      state.courseCurriculumFormData = action.payload;
    },
    setMediaUploadProgress: (state, action: PayloadAction<boolean>) => {
      state.mediaUploadProgress = action.payload;
    },
    setUploadedVideoUrl: (state, action: PayloadAction<string>) => {
      state.uploadedVideoUrl = action.payload;
    },
    setMediaUploadProgressPercentage: (
      state,
      action: PayloadAction<number>
    ) => {
      state.mediaUploadProgressPercentage = action.payload;
    },
    setInstructorCoursesList: (state, action: PayloadAction<any[]>) => {
      state.instructorCoursesList = action.payload;
    },
    setCurrentEditedCourseId: (state, action: PayloadAction<string | null>) => {
      state.currentEditedCourseId = action.payload;
    },
    resetCourseFormData: (state) => {
      state.courseLandingFormData = courseLandingInitialFormData;
      state.courseCurriculumFormData = courseCurriculumInitialFormData;
      state.mediaUploadProgress = false;
      state.mediaUploadProgressPercentage = 0;
      state.uploadedVideoUrl = "";
      state.currentEditedCourseId = null;
    },
  },
});

export const {
  setCourseLandingFormData,
  setCourseCurriculumFormData,
  setMediaUploadProgress,
  setMediaUploadProgressPercentage,
  setInstructorCoursesList,
  setCurrentEditedCourseId,
  setUploadedVideoUrl,
  resetCourseFormData,
} = instructorSlice.actions;

export default instructorSlice.reducer;
