/* global describe, it */

import chai from 'chai'

import {
  createMockProvider,
  deployContract,
  getWallets,
  solidity
} from 'ethereum-waffle'

import LinkdropFactory from '../build/LinkdropFactory'
import LinkdropMastercopy from '../build/LinkdropMastercopy'

import { computeBytecode, computeProxyAddress } from '../scripts/utils'

const ethers = require('ethers')
// Turn off annoying warnings
ethers.errors.setLogLevel('error')

chai.use(solidity)
const { expect } = chai

let provider = createMockProvider()

let [linkdropMaster, deployer, relayer] = getWallets(provider)

let masterCopy
let factory
let proxy
let bytecode

const initcode = '0x6352c7420d6000526103ff60206004601c335afa6040516060f3'
const chainId = 4 // Rinkeby
const campaignId = 0

describe('Proxy upgradability tests', () => {
  //

  it('should deploy initial master copy of linkdrop implementation', async () => {
    masterCopy = await deployContract(deployer, LinkdropMastercopy, [], {
      gasLimit: 6000000
    })
    expect(masterCopy.address).to.not.eq(ethers.constants.AddressZero)

    let masterCopyOwner = await masterCopy.owner()
    expect(masterCopyOwner).to.eq(ethers.constants.AddressZero)

    let masterCopyLinkdropMaster = await masterCopy.linkdropMaster()
    expect(masterCopyLinkdropMaster).to.eq(ethers.constants.AddressZero)

    let masterCopyVersion = await masterCopy.version()
    expect(masterCopyVersion).to.eq(0)

    let masterCopyChainId = await masterCopy.chainId()
    expect(masterCopyChainId).to.eq(0)
  })

  it('should deploy factory', async () => {
    factory = await deployContract(
      deployer,
      LinkdropFactory,
      [masterCopy.address, chainId],
      {
        gasLimit: 6000000
      }
    )
    expect(factory.address).to.not.eq(ethers.constants.AddressZero)
    let factoryVersion = await factory.masterCopyVersion()
    expect(factoryVersion).to.eq(1)

    let factoryChainId = await factory.chainId()
    expect(factoryChainId).to.eq(chainId)

    let masterCopyOwner = await masterCopy.owner()
    expect(masterCopyOwner).to.eq(ethers.constants.AddressZero)

    let masterCopyLinkdropMaster = await masterCopy.linkdropMaster()
    expect(masterCopyLinkdropMaster).to.eq(ethers.constants.AddressZero)

    let masterCopyVersion = await masterCopy.version()
    expect(masterCopyVersion).to.eq(factoryVersion)

    let masterCopyChainId = await masterCopy.chainId()
    expect(masterCopyChainId).to.eq(factoryChainId)
  })

  it('should deploy proxy and delegate to implementation', async () => {
    // Compute next address with js function
    let expectedAddress = computeProxyAddress(
      factory.address,
      linkdropMaster.address,
      campaignId,
      initcode
    )

    factory = factory.connect(linkdropMaster)

    await expect(
      factory.deployProxy(campaignId, {
        gasLimit: 6000000
      })
    ).to.emit(factory, 'Deployed')

    proxy = new ethers.Contract(
      expectedAddress,
      LinkdropMastercopy.abi,
      deployer
    )

    let linkdropMasterAddress = await proxy.linkdropMaster()
    expect(linkdropMasterAddress).to.eq(linkdropMaster.address)

    let version = await proxy.version()
    expect(version).to.eq(1)

    let owner = await proxy.owner()
    expect(owner).to.eq(factory.address)
  })

  it('should deploy second version of mastercopy', async () => {
    let oldMasterCopyAddress = masterCopy.address
    masterCopy = await deployContract(deployer, LinkdropMastercopy, [], {
      gasLimit: 6000000
    })

    expect(masterCopy.address).to.not.eq(ethers.constants.AddressZero)
    expect(masterCopy.address).to.not.eq(oldMasterCopyAddress)
  })

  it('should set mastercopy and update bytecode in factory', async () => {
    bytecode = computeBytecode(masterCopy.address)
    factory = factory.connect(deployer)
    await factory.setMasterCopy(masterCopy.address)
    let deployedBytecode = await factory.getBytecode()
    expect(deployedBytecode.toString().toLowerCase()).to.eq(
      bytecode.toString().toLowerCase()
    )
  })

  it('proxy owner should be able to destroy proxy', async () => {
    factory = factory.connect(linkdropMaster)

    let isDeployed = await factory.isDeployed(
      linkdropMaster.address,
      campaignId
    )
    expect(isDeployed).to.eq(true)

    let computedAddress = computeProxyAddress(
      factory.address,
      linkdropMaster.address,
      campaignId,
      initcode
    )

    let deployedAddress = await factory.functions.deployed(
      ethers.utils.solidityKeccak256(
        ['address', 'uint256'],
        [linkdropMaster.address, campaignId]
      )
    )
    expect(deployedAddress.toString().toLowerCase()).to.eq(
      computedAddress.toString().toLowerCase()
    )

    await expect(
      factory.destroyProxy(campaignId, {
        gasLimit: 6400000
      })
    ).to.emit(factory, 'Destroyed')

    isDeployed = await factory.isDeployed(linkdropMaster.address, campaignId)
    expect(isDeployed).to.eq(false)

    deployedAddress = await factory.functions.deployed(
      ethers.utils.solidityKeccak256(
        ['address', 'uint256'],
        [linkdropMaster.address, campaignId]
      )
    )
    expect(deployedAddress).to.eq(ethers.constants.AddressZero)
  })

  it('should deploy upgraded proxy to the same address as before', async () => {
    await expect(
      factory.deployProxy(campaignId, {
        gasLimit: 6400000
      })
    ).to.emit(factory, 'Deployed')

    let isDeployed = await factory.isDeployed(
      linkdropMaster.address,
      campaignId
    )
    expect(isDeployed).to.eq(true)

    let deployedAddress = await factory.functions.deployed(
      ethers.utils.solidityKeccak256(
        ['address', 'uint256'],
        [linkdropMaster.address, campaignId]
      )
    )

    let computedAddress = computeProxyAddress(
      factory.address,
      linkdropMaster.address,
      campaignId,
      initcode
    )

    expect(deployedAddress.toString().toLowerCase()).to.eq(
      computedAddress.toString().toLowerCase()
    )

    let factoryVersion = await factory.masterCopyVersion()
    expect(factoryVersion).to.eq(2)

    proxy = new ethers.Contract(
      computedAddress,
      LinkdropMastercopy.abi,
      deployer
    )

    let proxyVersion = await proxy.version()
    expect(proxyVersion).to.eq(factoryVersion)
  })
})
