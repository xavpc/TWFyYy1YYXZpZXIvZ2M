'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Device } from '@/types/device'
import { Search, Check, ChevronDown } from 'lucide-react'

import { useTranslations } from 'next-intl'

interface ComboboxProps {
  items: any[]
  displayProperty: string
  secondaryProperty?: string
  loading: boolean
  onSelect: (item: any | null) => void
  selectedItem: any | null
  placeholder: string
  label: string
  icon?: React.ReactNode
  statusProperty?: string
  disabled?: boolean
}

const Combobox: React.FC<ComboboxProps> = ({
  items,
  displayProperty,
  secondaryProperty,
  loading,
  onSelect,
  selectedItem,
  placeholder,
  label,
  icon,
  statusProperty,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = useTranslations('Session Viewer')

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Filter items based on search query
  useEffect(() => {
    if (items && items.length > 0) {
      const query = searchQuery.toLowerCase()
      setFilteredItems(
        items.filter((item) => {
          const primaryMatches = item[displayProperty]
            .toLowerCase()
            .includes(query)
          const secondaryMatches = secondaryProperty
            ? item[secondaryProperty].toLowerCase().includes(query)
            : false
          return primaryMatches || secondaryMatches
        })
      )
    } else {
      setFilteredItems([])
    }
  }, [items, searchQuery, displayProperty, secondaryProperty])

  // Get item status class
  const getStatusClass = (item: any) => {
    if (!statusProperty) return ''

    return item[statusProperty] === 'active' ? 'text-green-400' : 'text-red-400'
  }

  // Get item status indicator
  const getStatusIndicator = (item: any) => {
    if (!statusProperty) return null

    return (
      <span className={`inline-flex items-center ${getStatusClass(item)}`}>
        <span
          className={`h-1.5 w-1.5 rounded-full mr-1 ${
            item[statusProperty] === 'active' ? 'bg-green-400' : 'bg-red-400'
          }`}
        ></span>
        {item[statusProperty]}
      </span>
    )
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <div className='flex items-center space-x-2 mb-1'>
        {icon}
        <span
          className={`text-sm font-medium ${disabled ? 'text-gray-500' : ''}`}
        >
          {t('Device')}:
        </span>
      </div>

      <button
        type='button'
        className={`relative w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-left text-sm transition-all ${
          disabled
            ? 'opacity-60 cursor-not-allowed text-gray-400'
            : 'hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className='block truncate'>
          {selectedItem
            ? selectedItem[displayProperty]
            : `${t('Select a Device')}`}
        </span>
        <span className='absolute inset-y-0 right-0 flex items-center pr-2'>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {/* Dropdown Panel with fixed dimensions and scrollbar alignment */}
      {!disabled && isOpen && (
        <div
          className='absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden'
          style={{
            transformOrigin: 'top center',
            zIndex: 9999,
            maxHeight: '320px',
          }}
        >
          {/* Search input - sticky positioned */}
          <div className='px-3 py-2 sticky top-0 bg-gray-800 border-b border-gray-700 z-10'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search size={14} className='text-gray-500' />
              </div>
              <input
                ref={inputRef}
                type='text'
                className='block w-full pl-10 pr-3 py-1.5 border border-gray-600 rounded-md text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder={`${t('Search devices')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable content with fixed height */}
          <div className='overflow-y-auto' style={{ maxHeight: '260px' }}>
            {loading ? (
              <div className='px-3 py-2 text-sm text-gray-400 flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                {t('Loading')}...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className='px-3 py-2 text-sm text-gray-400'>
                {t('No items found')}
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-700 ${
                    selectedItem &&
                    selectedItem[displayProperty] === item[displayProperty] &&
                    (item.uniqueKey
                      ? selectedItem.uniqueKey === item.uniqueKey
                      : true)
                      ? 'bg-gray-700 text-blue-400'
                      : 'text-white'
                  }`}
                  onClick={() => {
                    onSelect(item)
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                >
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col'>
                      <span className='font-medium'>
                        {item[displayProperty]}
                      </span>
                      {secondaryProperty && (
                        <span className='text-xs text-gray-400'>
                          {item[secondaryProperty]}
                        </span>
                      )}
                    </div>

                    <div className='flex items-center space-x-2'>
                      {statusProperty && getStatusIndicator(item)}

                      {selectedItem &&
                        selectedItem[displayProperty] ===
                          item[displayProperty] &&
                        (item.uniqueKey
                          ? selectedItem.uniqueKey === item.uniqueKey
                          : true) && (
                          <Check size={14} className='text-blue-400' />
                        )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Combobox
