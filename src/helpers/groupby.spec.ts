import { assert } from 'chai';
import { describe, it } from 'mocha';
import { groupBy, Group, GroupBy } from './groupby';

describe('groupBy', () => {
    // Define test data
    const testData = [
        { id: 1, category: 'A', name: 'Item 1', value: 100 },
        { id: 2, category: 'A', name: 'Item 2', value: 200 },
        { id: 3, category: 'B', name: 'Item 3', value: 150 },
        { id: 4, category: 'B', name: 'Item 4', value: 250 },
        { id: 5, category: 'C', name: 'Item 5', value: 300 },
        { id: 6, category: 'A', name: 'Item 6', value: 400 }
    ];

    it('should group by a single key', () => {
        // Group by category
        const grouping: GroupBy<typeof testData[0]> = { keys: ['category'] };
        const result = groupBy(testData, grouping);

        // Should create 3 groups (A, B, C)
        assert.equal(result.length, 3, 'Should have created 3 groups');

        // Check Group A
        const groupA = result.find((g) => g.key.category === 'A');
        assert.exists(groupA, 'Group A should exist');
        assert.equal(groupA!.items.length, 3, 'Group A should have 3 items');
        assert.deepEqual(groupA!.key, { category: 'A' });

        // Check Group B
        const groupB = result.find((g) => g.key.category === 'B');
        assert.exists(groupB, 'Group B should exist');
        assert.equal(groupB!.items.length, 2, 'Group B should have 2 items');
        assert.deepEqual(groupB!.key, { category: 'B' });

        // Check Group C
        const groupC = result.find((g) => g.key.category === 'C');
        assert.exists(groupC, 'Group C should exist');
        assert.equal(groupC!.items.length, 1, 'Group C should have 1 item');
        assert.deepEqual(groupC!.key, { category: 'C' });
    });

    it('should group by multiple keys', () => {
        // Add more test data with combinations of keys
        const multiKeyData = [
            { id: 1, category: 'A', type: 'X', name: 'Item 1', value: 100 },
            { id: 2, category: 'A', type: 'X', name: 'Item 2', value: 200 },
            { id: 3, category: 'A', type: 'Y', name: 'Item 3', value: 150 },
            { id: 4, category: 'B', type: 'X', name: 'Item 4', value: 250 },
            { id: 5, category: 'B', type: 'Y', name: 'Item 5', value: 300 },
            { id: 6, category: 'A', type: 'Y', name: 'Item 6', value: 400 }
        ];

        const grouping: GroupBy<typeof multiKeyData[0]> = { keys: ['category', 'type'] };
        const result = groupBy(multiKeyData, grouping);

        // Should create 4 groups (A-X, A-Y, B-X, B-Y)
        assert.equal(result.length, 4, 'Should have created 4 groups');

        // Check Group A-X
        const groupAX = result.find((g) => g.key.category === 'A' && g.key.type === 'X');
        assert.exists(groupAX, 'Group A-X should exist');
        assert.equal(groupAX!.items.length, 2, 'Group A-X should have 2 items');
        assert.deepEqual(groupAX!.key, { category: 'A', type: 'X' });

        // Check Group A-Y
        const groupAY = result.find((g) => g.key.category === 'A' && g.key.type === 'Y');
        assert.exists(groupAY, 'Group A-Y should exist');
        assert.equal(groupAY!.items.length, 2, 'Group A-Y should have 2 items');
        assert.deepEqual(groupAY!.key, { category: 'A', type: 'Y' });

        // Check Group B-X
        const groupBX = result.find((g) => g.key.category === 'B' && g.key.type === 'X');
        assert.exists(groupBX, 'Group B-X should exist');
        assert.equal(groupBX!.items.length, 1, 'Group B-X should have 1 item');
        assert.deepEqual(groupBX!.key, { category: 'B', type: 'X' });

        // Check Group B-Y
        const groupBY = result.find((g) => g.key.category === 'B' && g.key.type === 'Y');
        assert.exists(groupBY, 'Group B-Y should exist');
        assert.equal(groupBY!.items.length, 1, 'Group B-Y should have 1 item');
        assert.deepEqual(groupBY!.key, { category: 'B', type: 'Y' });
    });

    it('should create deep copies of items in groups', () => {
        const grouping: GroupBy<typeof testData[0]> = { keys: ['category'] };
        const result = groupBy(testData, grouping);
        
        // Find an item in the grouped results
        const groupA = result.find((g) => g.key.category === 'A');
        const originalItem = testData[0];
        const groupedItem = groupA!.items.find(item => item.id === originalItem.id);
        
        // Modify the original item
        const originalValue = originalItem.value;
        originalItem.value = 999;
        
        // The grouped item should maintain its original value (deep copy)
        assert.equal(groupedItem!.value, originalValue, 'Grouped item should be a deep copy');
        assert.notEqual(groupedItem!.value, originalItem.value, 'Grouped item should not reference the original');
        
        // Reset for other tests
        originalItem.value = originalValue;
    });

    it('should throw an error when grouping by non-existent key', () => {
        const invalidGrouping: GroupBy<typeof testData[0]> = { keys: ['nonExistentKey' as keyof typeof testData[0]] };
        
        assert.throws(() => {
            groupBy(testData, invalidGrouping);
        }, 'One of the grouping.keys was not found in one of the elements in the array.');
    });

    it('should handle an empty array', () => {
        const emptyData: typeof testData = [];
        const grouping: GroupBy<typeof testData[0]> = { keys: ['category'] };
        const result = groupBy(emptyData, grouping);
        
        assert.equal(result.length, 0, 'Result should be an empty array');
    });

    it('should create a separate group for each unique combination of keys', () => {
        // Data with specific value combinations to test grouping logic
        const uniqueComboData = [
            { id: 1, region: 'North', status: 'Active', priority: 'High' },
            { id: 2, region: 'North', status: 'Active', priority: 'Low' },
            { id: 3, region: 'North', status: 'Inactive', priority: 'High' },
            { id: 4, region: 'South', status: 'Active', priority: 'High' },
            { id: 5, region: 'South', status: 'Active', priority: 'Low' },
            { id: 6, region: 'North', status: 'Active', priority: 'High' }, // Duplicate of first combination
        ];
        
        const grouping: GroupBy<typeof uniqueComboData[0]> = { 
            keys: ['region', 'status', 'priority'] 
        };
        
        const result = groupBy(uniqueComboData, grouping);
        
        // Should have 5 unique combinations
        assert.equal(result.length, 5, 'Should have 5 unique group combinations');
        
        // Find the group with duplicate entries (North-Active-High)
        const duplicateGroup = result.find(g => 
            g.key.region === 'North' && 
            g.key.status === 'Active' && 
            g.key.priority === 'High'
        );
        
        assert.exists(duplicateGroup, 'North-Active-High group should exist');
        assert.equal(duplicateGroup!.items.length, 2, 'Should have 2 items in the duplicate group');
        
        // Verify all unique combinations exist
        const combos = [
            { region: 'North', status: 'Active', priority: 'High' },
            { region: 'North', status: 'Active', priority: 'Low' },
            { region: 'North', status: 'Inactive', priority: 'High' },
            { region: 'South', status: 'Active', priority: 'High' },
            { region: 'South', status: 'Active', priority: 'Low' }
        ];
        
        combos.forEach(combo => {
            const group = result.find(g => 
                g.key.region === combo.region && 
                g.key.status === combo.status && 
                g.key.priority === combo.priority
            );
            assert.exists(group, `Group ${combo.region}-${combo.status}-${combo.priority} should exist`);
        });
    });

    it('should create groups with partial keys that match the specified keys only', () => {
        const grouping: GroupBy<typeof testData[0]> = { keys: ['category'] };
        const result = groupBy(testData, grouping);
        
        result.forEach(group => {
            // Each group's key should only contain the 'category' property
            const keyProps = Object.keys(group.key);
            assert.equal(keyProps.length, 1, 'Group key should have exactly 1 property');
            assert.include(keyProps, 'category', 'Group key should contain only the category property');
        });
    });
});