# Glossary Feature - Deployment Checklist

## Pre-Deployment

### 1. Database Setup
- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy contents of `supabase/migrations/create_glossary_table.sql`
- [ ] Run the migration
- [ ] Verify table created successfully (check Table Editor)
- [ ] Copy contents of `supabase/migrations/sample_glossary_data.sql`
- [ ] Run sample data (optional, for testing)
- [ ] Verify sample entries appear in glossary table

### 2. Code Review
- [ ] Review changes in `src/components/MultiGapFillExerciseNew.js`
- [ ] Review new files:
  - [ ] `src/components/GlossaryTooltip.js`
  - [ ] `src/components/TextWithGlossary.js`
  - [ ] `src/lib/glossaryUtils.js`
- [ ] Verify no merge conflicts
- [ ] Check imports are correct

### 3. Local Testing
- [ ] Run `npm install` (verify dependencies)
- [ ] Run `npm run dev`
- [ ] Open a unit in browser
- [ ] Test Full Text view:
  - [ ] Click "Show Full Text"
  - [ ] Hover over sample term (should see dotted underline)
  - [ ] Click term (tooltip should appear)
  - [ ] Verify translation shows
  - [ ] Verify notes show (if present)
  - [ ] Click "Save for Practice"
  - [ ] Verify toast notification
  - [ ] Verify button changes to "Saved"
- [ ] Test Gap Fill view:
  - [ ] Switch to gap fill
  - [ ] Hover over text between gaps
  - [ ] Click glossary term
  - [ ] Verify tooltip works same as full text
- [ ] Test Unit Modal:
  - [ ] Open unit from Activity Flow
  - [ ] Test glossary in modal
- [ ] Test mobile view (responsive design):
  - [ ] Open dev tools, switch to mobile view
  - [ ] Test tap interaction
  - [ ] Verify tooltip positioning

### 4. Build Verification
- [ ] Run `npm run build`
- [ ] Verify build completes successfully
- [ ] Check for any new errors or warnings
- [ ] Run `npm start` to test production build locally

## Deployment

### 5. Git Operations
- [ ] Commit changes with descriptive message:
  ```bash
  git add .
  git commit -m "Add inline glossary feature with translations and notes"
  ```
- [ ] Push to repository:
  ```bash
  git push origin main
  ```

### 6. Production Database
- [ ] Access production Supabase dashboard
- [ ] Run `create_glossary_table.sql` in production SQL Editor
- [ ] Verify table created in production
- [ ] Run `sample_glossary_data.sql` (optional)

### 7. Production Deployment
- [ ] Deploy to hosting platform (Vercel/Netlify/etc.)
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors

## Post-Deployment

### 8. Production Testing
- [ ] Open production URL
- [ ] Navigate to a unit
- [ ] Test glossary feature:
  - [ ] Hover over terms
  - [ ] Click to open tooltip
  - [ ] Verify translations
  - [ ] Test save functionality
  - [ ] Verify toast notifications
- [ ] Test on different browsers:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Test on mobile devices:
  - [ ] iOS Safari
  - [ ] Chrome Mobile
  - [ ] Android Browser

### 9. User Experience Verification
- [ ] Create test user account (if needed)
- [ ] Set user level to Beginner
- [ ] Verify only Beginner terms appear
- [ ] Change level to Intermediate
- [ ] Verify Beginner + Intermediate terms appear
- [ ] Change level to Advanced
- [ ] Verify all terms appear

### 10. Data Population
- [ ] Review your unit texts
- [ ] Identify common eco-vocabulary
- [ ] Use `docs/GLOSSARY_QUICK_START.md` to add terms
- [ ] Aim for 50-100 initial terms covering:
  - [ ] Basic ecology terms (Beginner)
  - [ ] Intermediate concepts
  - [ ] Advanced terminology
  - [ ] Common multi-word phrases

## Monitoring

### 11. First Week Checks
- [ ] Monitor error logs for glossary-related issues
- [ ] Check `/api/vocabulary/personal` endpoint logs
- [ ] Verify database queries performing well
- [ ] Watch for user feedback
- [ ] Check if users are saving words

### 12. Performance Monitoring
- [ ] Check page load times (should not increase)
- [ ] Monitor database query performance
- [ ] Verify no memory leaks (long sessions)
- [ ] Check mobile performance

## Content Management

### 13. Ongoing Glossary Maintenance
- [ ] Set up process for adding new terms
- [ ] Review term translations for accuracy
- [ ] Update notes based on user feedback
- [ ] Add terms as new units are created
- [ ] Consider creating glossary spreadsheet

### 14. User Feedback
- [ ] Monitor user questions about glossary
- [ ] Collect feedback on term selection
- [ ] Note which terms are saved most often
- [ ] Adjust difficulty levels if needed

## Documentation

### 15. Team Training
- [ ] Share `docs/GLOSSARY_QUICK_START.md` with content team
- [ ] Demonstrate how to add terms
- [ ] Show how to test terms in units
- [ ] Explain difficulty level system

### 16. Documentation Updates
- [ ] Update main README if needed
- [ ] Add glossary feature to changelog
- [ ] Update user guide/help docs
- [ ] Create video tutorial (optional)

## Troubleshooting

### Common Issues

**Issue**: Terms not appearing in text
- [ ] Check term exists in database
- [ ] Verify spelling matches exactly
- [ ] Check difficulty level settings
- [ ] Verify word boundary matching

**Issue**: Tooltip not opening
- [ ] Check browser console for errors
- [ ] Verify click handler working
- [ ] Check z-index conflicts
- [ ] Test in incognito mode

**Issue**: Save button not working
- [ ] Verify user is logged in
- [ ] Check API endpoint responding
- [ ] Review network tab for errors
- [ ] Verify Supabase permissions

**Issue**: Slow performance
- [ ] Check database indexes
- [ ] Verify query optimization
- [ ] Test with fewer glossary terms
- [ ] Review browser memory usage

## Rollback Plan

If critical issues arise:

### Emergency Rollback Steps
1. [ ] Identify the issue
2. [ ] Disable feature via feature flag (if available)
3. [ ] Or revert to previous deployment
4. [ ] Investigate and fix issue locally
5. [ ] Re-test thoroughly
6. [ ] Re-deploy when ready

### Partial Rollback (Keep Database)
- [ ] Database table can stay (won't affect app)
- [ ] Revert code changes only
- [ ] Fix issues
- [ ] Re-deploy code

## Success Criteria

Feature is successful when:
- [ ] ✅ Build completes without errors
- [ ] ✅ Users can click glossary terms
- [ ] ✅ Tooltips display correctly
- [ ] ✅ Translations are accurate
- [ ] ✅ Save functionality works
- [ ] ✅ No performance degradation
- [ ] ✅ Works on all target browsers
- [ ] ✅ Works on mobile devices
- [ ] ✅ No user complaints about broken features
- [ ] ✅ Users actively using the feature

## Next Steps After Deployment

### Phase 2 Enhancements (Future)
- [ ] Add admin UI for managing glossary
- [ ] Implement audio pronunciations
- [ ] Add usage analytics
- [ ] Create glossary search feature
- [ ] Expand to more languages
- [ ] Add user-submitted translations

---

**Prepared by**: Claude
**Date**: 2025-12-28
**Version**: 1.0
**Status**: Ready for Deployment ✅
