// Apply requirement filters and collect tags in one pass
export function applyRequirementFilters(course, filters) {
    let score = 0;
    let shouldKeep = true;
    const matchingTags = []; // Array to collect requirement tags
    
    // Get all requirement filters
    const requirementFilters = Object.entries(filters.majorRequirements || {});
    if (requirementFilters.length === 0) {
        return { score, shouldKeep, tags: matchingTags };
    }
    
    // Check for any "only" filters
    const onlyFilters = requirementFilters.filter(([_, filter]) => filter.only);
    if (onlyFilters.length > 0) {
        // Course must be in at least one of the "only" requirements
        const matchesAnyOnly = onlyFilters.some(([reqId]) => {
            const requirement = academicData?.requirements?.[reqId];
            const matches = requirement && isCourseInRequirement(course.id, requirement);
            
            // If matching and has tag, collect it
            if (matches && requirement.tag) {
                matchingTags.push(requirement.tag);
            }
            
            return matches;
        });
        
        if (!matchesAnyOnly) {
            shouldKeep = false;
            return { score, shouldKeep, tags: matchingTags };
        }
    }

    // Apply "prefer" filters - add points and collect tags
    const preferFilters = requirementFilters.filter(([_, filter]) => filter.prefer);
    preferFilters.forEach(([reqId]) => {
        const requirement = academicData?.requirements?.[reqId];
        if (requirement && isCourseInRequirement(course.id, requirement)) {
            // Add score
            score += 20;
            
            // Collect tag if it exists and isn't already in the list
            if (requirement.tag && !matchingTags.includes(requirement.tag)) {
                matchingTags.push(requirement.tag);
            }
        }
    });
    
    return { score, shouldKeep, tags: matchingTags };
};

export function applyDistributionFilters(course, filters) {
    let score = 0;
    let shouldKeep = true;
    const matchingTags = [];
    const hasDistOnlyFilter = Object.entries(filters.collegeDistributions)
                                    .some(([_, value]) => value.only);
    // Early return if course has no distributions
    if (!course.distr || !Array.isArray(course.distr)) {
        if (hasDistOnlyFilter) {
            shouldKeep = false;
        }
        return { score, shouldKeep, tags: matchingTags };
    }
    
    if (hasDistOnlyFilter) {
        // Find all matching distribution codes
        const matchingDists = course.distr.filter(dist => 
            dist && filters.collegeDistributions[dist]?.only
        );
        
        if (matchingDists.length === 0) {
            shouldKeep = false;
        } else {
            // Add the actual matching distribution codes as tags
            matchingTags.push(...matchingDists);
        }
    }
    
    // Apply "prefer" scoring regardless of "only" filter result
    course.distr.forEach(dist => {
        if (dist && filters.collegeDistributions[dist]?.prefer) {
            score += 10;
            
            // Only add to tags if not already included
            if (!matchingTags.includes(dist)) {
                matchingTags.push(dist);
            }
        }
    });
    
    return { score, shouldKeep, tags: matchingTags };
};