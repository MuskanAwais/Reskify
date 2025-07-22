# Manual Testing Guide: Embedded PDF Generator Integration

## Quick Start Testing

### 1. Visual Verification
Navigate to SWMS Builder page and verify:
- [ ] "Live PDF Preview" section appears below the form
- [ ] Green "RiskTemplateBuilder" badge is visible
- [ ] Iframe loads your PDF generator app
- [ ] Connection status shows green dot with "Live Preview Active"

### 2. Basic Form Integration Test
1. Enter project name: "Test Project Integration"
2. Add job number: "INT-001"
3. Enter address: "123 Test Street, Sydney NSW"
4. Verify: Preview updates automatically as you type

### 3. Control Interface Test
- [ ] Zoom Out button (50% minimum)
- [ ] Zoom In button (200% maximum)  
- [ ] Fullscreen toggle works
- [ ] "Open Full" opens RiskTemplateBuilder in new tab
- [ ] Refresh button updates preview

### 4. Real-Time Data Flow Test
Complete each SWMS step and verify preview updates:
- Step 1: Project details populate immediately
- Step 2: Activities appear in preview
- Step 3: HRCW categories transmit
- Step 4: PPE requirements update
- Step 5: Equipment specifications show
- Step 6: Emergency procedures display

### 5. Performance Validation
- Form responds within 500ms of typing
- Preview scales smoothly
- No browser lag during updates
- Memory usage remains stable

## Advanced Testing Scenarios

### Company Logo Integration
1. Upload company logo in Step 1
2. Verify logo appears in PDF preview
3. Change logo and confirm update
4. Check logo persists for future projects

### Complex SWMS Testing
Create comprehensive SWMS with:
- 10+ work activities
- Multiple HRCW categories
- Full PPE selection
- 5+ equipment items
- Emergency procedures

Verify all data transmits correctly to preview.

### Error Recovery Testing
1. Disable internet briefly
2. Re-enable and verify reconnection
3. Test with invalid form data
4. Confirm system handles errors gracefully

## Browser Compatibility

Test in multiple browsers:
- Chrome 120+ (Primary target)
- Firefox 121+ 
- Safari 17+
- Edge 120+

Verify consistent behavior across all platforms.

## Mobile Responsiveness

Test on various screen sizes:
- Phone (320px-768px): Preview scales appropriately
- Tablet (768px-1024px): Full functionality maintained
- Desktop (1024px+): Optimal experience

## Production Readiness Checklist

- [ ] All form fields transmit correctly
- [ ] Preview updates in real-time
- [ ] Controls function properly
- [ ] No JavaScript errors in console
- [ ] Performance meets requirements
- [ ] Cross-browser compatibility confirmed
- [ ] Mobile experience validated
- [ ] Error handling works properly
- [ ] Security sandbox properly configured
- [ ] PostMessage communication secure

## Troubleshooting

### Preview Not Loading
1. Check network connection to risktemplatebuilder.replit.app
2. Verify iframe src URL is correct
3. Check browser console for errors
4. Try refreshing the page

### Data Not Updating
1. Confirm connection status is green
2. Check form validation is passing
3. Verify required fields are completed
4. Try manual refresh button

### Performance Issues
1. Check browser memory usage
2. Clear browser cache
3. Test in incognito mode
4. Verify other browser tabs aren't consuming resources

## Success Criteria

Integration is considered successful when:
- Visual preview matches your RiskTemplateBuilder exactly
- All form data transmits without loss
- Real-time updates work seamlessly
- Performance meets user expectations
- Error handling is robust
- Cross-platform compatibility is maintained

## Next Steps After Testing

Once testing confirms integration works:
1. Deploy to production environment
2. Monitor real-world usage patterns
3. Collect user feedback
4. Plan future enhancements
5. Document any discovered edge cases