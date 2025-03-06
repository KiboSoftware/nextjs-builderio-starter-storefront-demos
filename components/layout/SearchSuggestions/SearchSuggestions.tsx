import React, { useEffect, useState } from 'react'

import {
  Backdrop,
  Box,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  SxProps,
  Theme,
  Typography,
} from '@mui/material'
import getConfig from 'next/config'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { SearchBar } from '@/components/common'
import { useDebounce, useGetSearchSuggestion2 } from '@/hooks'

const style = {
  paper: {
    borderRadius: 0,
    position: 'relative',
    zIndex: 1400,
    width: '100%',
    maxWidth: { xs: '100%', md: 661 },
  } as SxProps<Theme> | undefined,
  list: {
    p: 2,
  },
  listItem: {
    '&:focus': {
      backgroundColor: 'transparent',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  listItemText: {
    fontSize: (theme: Theme) => theme.typography.body2,
    margin: 0,
  } as SxProps<Theme> | undefined,
}

interface SearchSuggestionsProps {
  onEnterSearch?: () => void
  isViewSearchPortal?: boolean
}

interface ListItemProps {
  code?: string
  name?: string
  path?: string
  onSearchSuggestionClose?: () => void
}

const Title = ({ heading }: { heading: string }) => {
  const { t } = useTranslation('common')

  return (
    <ListItem key="Suggestions" sx={{ ...style.listItem }}>
      <Typography fontWeight={600} variant="subtitle1">
        {t(heading)}
      </Typography>
    </ListItem>
  )
}
const Content = (props: ListItemProps & { imageUrl?: string }) => {
  const { code, name, path = '', onSearchSuggestionClose, imageUrl } = props

  return (
    <Link href={`${path}${code}`} passHref>
      <ListItem
        key={code}
        onClick={onSearchSuggestionClose}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        {imageUrl && (
          <Box
            component="img"
            src={imageUrl}
            alt={name}
            sx={{
              width: 40,
              height: 40,
              objectFit: 'contain',
              borderRadius: 1,
              marginRight: 1,
            }}
          />
        )}
        <ListItemText primary={name} sx={{ ...style.listItemText }} />
      </ListItem>
    </Link>
  )
}

const SearchSuggestionSkeletons = () => {
  return (
    <>
      <List sx={{ ...style.list }} role="group">
        <Title heading="suggestions" />
        {[1, 2, 3].map((item) => (
          <ListItem key={item} sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton
              variant="rectangular"
              width={40}
              height={40}
              sx={{ borderRadius: 1, marginRight: 1 }}
            />
            <Skeleton variant="text" width="80%" height={24} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List sx={{ ...style.list }} role="group">
        <Title heading="categories" />
        {[1, 2, 3].map((item) => (
          <ListItem key={item}>
            <Skeleton variant="text" width="100%" height={24} />
          </ListItem>
        ))}
      </List>
    </>
  )
}

const SearchSuggestions = (props: SearchSuggestionsProps) => {
  const { onEnterSearch, isViewSearchPortal } = props
  const { publicRuntimeConfig } = getConfig()
  const router = useRouter()
  const { t } = useTranslation('common')

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)
  const handleSearch = (userEnteredValue: string) => setSearchTerm(userEnteredValue)
  const handleEnterSearch = (value: string) => {
    router.push({ pathname: '/search', query: { search: value } })
    if (isViewSearchPortal) onEnterSearch?.()
    handleClose()
  }

  const searchSuggestionResult = useGetSearchSuggestion2(
    useDebounce(searchTerm.trim(), publicRuntimeConfig.debounceTimeout)
  )

  const getSuggestionGroup = (title: string) =>
    searchSuggestionResult.data
      ? searchSuggestionResult.data?.suggestionGroups?.find((sg) => sg?.name === title)
      : null
  const productSuggestionGroup = getSuggestionGroup('Products')
  const categorySuggestionGroup = getSuggestionGroup('Categories')

  useEffect(() => {
    searchTerm.trim() ? handleOpen() : handleClose()
  }, [searchTerm])

  return (
    <Stack width="100%" position="relative" gap={1} sx={{ maxWidth: { xs: '100%', md: '65%' } }}>
      <Box sx={{ zIndex: 1400 }}>
        <SearchBar
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onKeyEnter={handleEnterSearch}
          showClearButton
        />
      </Box>
      <Collapse
        in={isOpen}
        timeout="auto"
        unmountOnExit
        role="contentinfo"
        sx={{ position: 'absolute', top: '50px', width: '100%' }}
      >
        <Paper sx={{ ...style.paper }}>
          {searchSuggestionResult.isLoading ? (
            <SearchSuggestionSkeletons />
          ) : (
            <>
              {productSuggestionGroup?.suggestions &&
                productSuggestionGroup.suggestions.length > 0 && (
                  <List sx={{ ...style.list }} role="group">
                    <Title heading="suggestions" />
                    {productSuggestionGroup?.suggestions?.map((product) => (
                      <Content
                        key={product?.suggestion?.productCode}
                        code={product?.suggestion?.productCode}
                        name={product?.suggestion?.productName}
                        path={'/product/'}
                        imageUrl={product?.suggestion?.productImageUrls?.[0]} // Use first image URL
                        onSearchSuggestionClose={handleClose}
                      />
                    ))}
                  </List>
                )}

              {categorySuggestionGroup?.suggestions &&
                categorySuggestionGroup.suggestions.length > 0 && (
                  <>
                    <Divider />
                    <List sx={{ ...style.list }} role="group">
                      <Title heading="categories" />
                      {categorySuggestionGroup?.suggestions?.map((category) => (
                        <Content
                          key={category?.suggestion?.categoryCategoryCode}
                          code={category?.suggestion?.categoryCategoryCode}
                          name={category?.suggestion?.categoryName}
                          path={'/category/'}
                          onSearchSuggestionClose={handleClose}
                        />
                      ))}
                    </List>
                  </>
                )}
            </>
          )}
        </Paper>
      </Collapse>
      <Backdrop open={isOpen} onClick={handleClose} data-testid="backdrop"></Backdrop>
    </Stack>
  )
}

export default SearchSuggestions
