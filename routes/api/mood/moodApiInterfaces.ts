export interface IDbActivityGroup {
	activityGroupName: string,
	activityGroupId: string,
	iconUrl: string,
	iconAltText: string,
}

export interface IDbActivity {
	activityName: string,
	activityId: number,
	activityGroupId: string,
	iconUrl: string,
	iconAltText: string,
}

export interface IDbMood {
	moodId: number,
	moodName: string,
	moodOrder: string,
	iconUrl: string,
	iconAltText: string,
}

export interface IDbEntry {
	entryId: number,
	timestamp: string,
	entryNotes: string,
	mood: string,
	moodId: number,
	moodIconUrl: string,
	moodIconAltText: string,
}

export interface IDbEntryActivities {
	entryId: number,
	activityName: string,
	activityId: number,
	activityIconUrl: string,
	activityIconAltText: string,
	activityGroup: string,
	activityGroupIconUrl: string,
	activityGroupIconAltText: string,
}

export interface IDbEntriesImages {
	url: string,
	altText: string,
	entryId: number
}